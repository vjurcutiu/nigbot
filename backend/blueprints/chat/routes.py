"""routes.py

Inbox API endpoints and Socket.IO event handlers.

Key improvements
----------------
* **Fixed** Werkzeug `AssertionError: write() before start_response` by
  guaranteeing every Flask view returns a tuple `(body, status)` or a
  *real* :class:`flask.Response`; especially ``mark_read`` now returns an
  **empty string** with *204 No Content*.
* **Removed** duplicate ``register_socket_handlers`` definition and made
  socket registration idempotent.
* Added *type hints*, *inline docs*, and *structured logging* for easier
  maintenance.
* Centralised helpers (``verify_token``, ``get_conversation_or_404``)
  and **avoided unnecessary DB round‑trips**.
* Adopted **consistent JSON shapes** across routes.

Note
----
Assumes the following project structure::

    db/
      models.py
    extensions.py        # exposes ``socketio`` instance
    routes.py  ← you are here

"""


from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict, Tuple, List

import jwt
from flask import (
    Blueprint,
    abort,
    current_app,
    jsonify,
    request,
)
from flask_login import current_user, login_required
from flask_socketio import disconnect, emit, join_room, leave_room

from db.models import Conversation, Message, Participant, User, db
from extensions import socketio

#: Namespace for all inbox‑related realtime events
SOCKET_NAMESPACE = "/inbox"

logger = logging.getLogger(__name__)
inbox_bp = Blueprint("inbox", __name__, url_prefix="/api")


# --------------------------------------------------------------------------- #
# Helpers                                                                     #
# --------------------------------------------------------------------------- #
def verify_token(token: str | None) -> User | None:
    """Return the :class:`~db.models.User` encoded in *token* or *None*.

    Token is assumed to be a **JWT** signed with the app's
    :pydataattr:`flask.Flask.config['SECRET_KEY']`.
    """
    if not token:
        return None
    try:
        data = jwt.decode(
            token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
        return User.query.get(data.get("user_id"))
    except Exception:  # pragma: no cover – any JWT error
        logger.debug("Token verification failed", exc_info=True)
        return None


def get_conversation_or_404(conv_id: int) -> Tuple[Conversation, Participant]:
    """Return *(conversation, participant)* or abort appropriately."""
    conv = Conversation.query.get_or_404(conv_id)
    part = Participant.query.filter_by(
        conversation_id=conv.id, user_id=current_user.id
    ).first()
    if part is None:
        abort(403, "Not a participant")
    return conv, part


def conversation_to_dict(conv: Conversation) -> Dict[str, Any]:
    """Lightweight serialiser for *Conversation* objects."""
    last_msg: Message | None = (
        Message.query.filter_by(conversation_id=conv.id)
        .order_by(Message.created_at.desc())
        .first()
    )
    unread_count = (
        Message.query.filter_by(conversation_id=conv.id, is_read=False)
        .filter(Message.sender_id != current_user.id)
        .count()
    )
    return {
        "id": conv.id,
        "title": getattr(conv, "title", None),
        "created_at": conv.created_at.isoformat(),
        "updated_at": getattr(conv, "updated_at", conv.created_at).isoformat(),
        "last_message": message_to_dict(last_msg) if last_msg else None,
        "unread_count": unread_count,
    }


def message_to_dict(msg: Message) -> Dict[str, Any]:
    """Serialise *Message* objects for JSON responses."""
    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "body": msg.body,
        "created_at": msg.created_at.isoformat(),
        "is_read": msg.is_read,
    }


# --------------------------------------------------------------------------- #
# REST routes                                                                 #
# --------------------------------------------------------------------------- #
@inbox_bp.route("/conversations", methods=["GET"])
@login_required
def list_conversations() -> Tuple[Any, int]:
    parts: List[Participant] = Participant.query.filter_by(
        user_id=current_user.id
    ).all()
    conversations = [conversation_to_dict(p.conversation) for p in parts]
    return jsonify(conversations), 200


@inbox_bp.route("/conversations/<int:conv_id>/messages", methods=["GET"])
@login_required
def get_messages(conv_id: int) -> Tuple[Any, int]:
    conv, _ = get_conversation_or_404(conv_id)
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 50, type=int)

    pagination = (
        Message.query.filter_by(conversation_id=conv.id)
        .order_by(Message.created_at.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )
    msgs = [message_to_dict(m) for m in pagination.items]
    resp: Dict[str, Any] = {
        "items": msgs,
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages,
        "per_page": pagination.per_page,
    }
    return jsonify(resp), 200


@inbox_bp.route("/conversations/<int:conv_id>/messages", methods=["POST"])
@login_required
def send_message(conv_id: int) -> Tuple[Any, int]:
    conv, part = get_conversation_or_404(conv_id)
    data: Dict[str, Any] = request.get_json(silent=True) or {}
    body: str | None = data.get("body")

    if not body:
        abort(400, "'body' is required")

    msg = Message(
        conversation_id=conv.id,
        sender_id=current_user.id,
        body=body,
        created_at=datetime.utcnow(),
    )
    db.session.add(msg)
    db.session.commit()

    payload = message_to_dict(msg)
    room = f"conv_{conv.id}"
    emit("new_message", payload, namespace=SOCKET_NAMESPACE, room=room)

    return jsonify(payload), 201


@inbox_bp.route("/conversations/<int:conv_id>/mark_read", methods=["POST"])
@login_required
def mark_read(conv_id: int) -> Tuple[str, int]:
    conv, part = get_conversation_or_404(conv_id)
    updated = (
        Message.query.filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.is_read.is_(False),
        )
        .update({"is_read": True, "read_at": datetime.utcnow()})
    )
    if updated:
        db.session.commit()
        logger.debug("Marked %s messages as read in conv %s", updated, conv.id)
    return "", 204  # <-- Fixes Werkzeug AssertionError


@inbox_bp.route("/conversations/<int:conv_id>", methods=["DELETE"])
@login_required
def leave_conversation(conv_id: int) -> Tuple[str, int]:
    conv, part = get_conversation_or_404(conv_id)
    db.session.delete(part)
    db.session.commit()

    # if no more participants, clean up conversation & messages
    if not Participant.query.filter_by(conversation_id=conv.id).count():
        Message.query.filter_by(conversation_id=conv.id).delete()
        db.session.delete(conv)
        db.session.commit()

    return "", 204


# --------------------------------------------------------------------------- #
# Socket.IO                                                                   #
# --------------------------------------------------------------------------- #
def register_socket_handlers() -> None:
    """Register inbox Socket.IO event handlers exactly once."""

    # Guard against double‑registration when using the reloader
    if getattr(register_socket_handlers, "_registered", False):
        logger.debug("Socket handlers already registered – skipping")
        return
    register_socket_handlers._registered = True  # type: ignore[attr-defined]

    @socketio.on("connect", namespace=SOCKET_NAMESPACE)
    def on_connect():  # noqa: D401
        logger.debug("Client connected to %s", SOCKET_NAMESPACE)

    @socketio.on("join", namespace=SOCKET_NAMESPACE)
    def on_join(data: Dict[str, Any]):  # noqa: D401
        token = data.get("token")
        conv_id = int(data.get("conversation_id")) if data.get("conversation_id") is not None else None

        user = verify_token(token)
        if not user:
            disconnect()
            return

        conv = Conversation.query.get(conv_id)
        if not conv or not Participant.query.filter_by(
            conversation_id=conv.id, user_id=user.id
        ).first():
            disconnect()
            return

        join_room(room := f"conv_{conv.id}")
        emit("joined", {"conversation_id": conv.id}, room=room)
        logger.debug("User %s joined room %s", user.id, room)

    @socketio.on("leave", namespace=SOCKET_NAMESPACE)
    def on_leave(data: Dict[str, Any]):  # noqa: D401
        token = data.get("token")
        conv_id = int(data.get("conversation_id")) if data.get("conversation_id") is not None else None

        user = verify_token(token)
        if not user:
            disconnect()
            return

        leave_room(room := f"conv_{conv_id}")
        emit("left", {"conversation_id": conv_id}, room=room)
        logger.debug("User %s left room %s", user.id, room)

    @socketio.on("send", namespace=SOCKET_NAMESPACE)
    def on_send(data: Dict[str, Any]):  # noqa: D401
        """Realtime send message (alternative to REST POST)."""
        token = data.get("token")
        body = data.get("body")
        conv_id = data.get("conversation_id", type=int)

        user = verify_token(token)
        if not user or not body:
            emit("error", {"message": "unauthorised or empty body"})
            return

        conv = Conversation.query.get(conv_id)
        if not conv or not Participant.query.filter_by(
            conversation_id=conv.id, user_id=user.id
        ).first():
            emit("error", {"message": "conversation not found"})
            return

        msg = Message(
            conversation_id=conv.id,
            sender_id=user.id,
            body=body,
            created_at=datetime.utcnow(),
        )
        db.session.add(msg)
        db.session.commit()

        payload = message_to_dict(msg)
        emit("new_message", payload, room=f"conv_{conv.id}")
        logger.debug("User %s sent message %s in conv %s", user.id, msg.id, conv.id)


# --------------------------------------------------------------------------- #
# Blueprint / Socket registration                                             #
# --------------------------------------------------------------------------- #
def init_app(app) -> None:
    """Call this during application factory initialisation."""
    app.register_blueprint(inbox_bp)
    register_socket_handlers()


# --------------------------------------------------------------------------- #
# __all__                                                                     #
# --------------------------------------------------------------------------- #
__all__ = [
    "inbox_bp",
    "register_socket_handlers",
    "init_app",
]
