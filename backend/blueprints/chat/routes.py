from flask import Blueprint, request, jsonify, abort
from flask_login import login_required, current_user
from db.models import db, Conversation, Participant, Message
from datetime import datetime
from flask_socketio import emit, join_room, leave_room
from extensions import socketio

inbox_bp = Blueprint('inbox', __name__, url_prefix='/api')

# Helper to get conversation or 404
def get_conversation_or_404(conv_id):
    conv = Conversation.query.get(conv_id)
    if not conv:
        abort(404, description="Conversation not found")
    # Ensure current_user is participant
    part = Participant.query.filter_by(conversation_id=conv.id, user_id=current_user.id).first()
    if not part:
        abort(403, description="Not authorized")
    return conv, part

@inbox_bp.route('/conversations', methods=['GET'])
@login_required
def list_conversations():
    parts = Participant.query.filter_by(user_id=current_user.id).all()
    convos = []
    for p in parts:
        conv = Conversation.query.get(p.conversation_id)
        last_msg = Message.query.filter_by(conversation_id=conv.id).order_by(Message.created_at.desc()).first()
        unread = Message.query.filter(
            Message.conversation_id == conv.id,
            Message.created_at > p.last_read
        ).count()
        convos.append({
            'id': conv.id,
            'last_message': {
                'sender_id': last_msg.sender_id,
                'body': last_msg.body,
                'created_at': last_msg.created_at.isoformat() + 'Z'
            } if last_msg else None,
            'unread_count': unread
        })
    return jsonify(convos), 200

@inbox_bp.route('/conversations', methods=['POST'])
@login_required
def create_conversation():
    data = request.get_json() or {}
    participant_ids = data.get('participant_ids', [])
    if current_user.id not in participant_ids:
        participant_ids.append(current_user.id)
    conv = Conversation()
    db.session.add(conv)
    db.session.flush()
    for uid in set(participant_ids):
        db.session.add(Participant(conversation_id=conv.id, user_id=uid, last_read=datetime.utcnow()))
    db.session.commit()
    return jsonify({'id': conv.id}), 201

@inbox_bp.route('/conversations/<int:conv_id>/messages', methods=['GET'])
@login_required
def get_messages(conv_id):
    conv, part = get_conversation_or_404(conv_id)
    cursor = request.args.get('cursor')
    limit = int(request.args.get('limit', 50))
    qs = Message.query.filter_by(conversation_id=conv.id)
    if cursor:
        try:
            cursor_dt = datetime.fromisoformat(cursor)
            qs = qs.filter(Message.created_at < cursor_dt)
        except ValueError:
            abort(400, description="Invalid cursor format")
    msgs = qs.order_by(Message.created_at.desc()).limit(limit + 1).all()
    next_cursor = None
    if len(msgs) > limit:
        next_cursor = msgs[-1].created_at.isoformat() + 'Z'
        msgs = msgs[:-1]
    msgs = list(reversed(msgs))
    return jsonify({
        'messages': [
            {
                'id': m.id,
                'sender_id': m.sender_id,
                'body': m.body,
                'created_at': m.created_at.isoformat() + 'Z'
            } for m in msgs
        ],
        'nextCursor': next_cursor
    }), 200

@inbox_bp.route('/conversations/<int:conv_id>/messages', methods=['POST'])
@login_required
def post_message(conv_id):
    conv, part = get_conversation_or_404(conv_id)
    data = request.get_json() or {}
    body = data.get('body')
    if not body:
        abort(400, description="Message body required")
    msg = Message(conversation_id=conv.id, sender_id=current_user.id, body=body)
    db.session.add(msg)
    db.session.commit()
    payload = {
        'id': msg.id,
        'conversation_id': conv.id,
        'sender_id': msg.sender_id,
        'body': msg.body,
        'created_at': msg.created_at.isoformat() + 'Z'
    }
    # Emit to room conv_<id>
    socketio.emit('new_message', payload, room=f'conv_{conv.id}', namespace='/inbox')
    return jsonify(payload), 201

@inbox_bp.route('/conversations/<int:conv_id>/read', methods=['POST'])
@login_required
def mark_read(conv_id):
    conv, part = get_conversation_or_404(conv_id)
    part.last_read = datetime.utcnow()
    db.session.commit()
    return '', 204

# SocketIO event handlers
def register_socket_handlers():
    @socketio.on('join', namespace='/inbox')
    @login_required
    def on_join(data):
        conv_id = data.get('conversation_id')
        conv, part = get_conversation_or_404(conv_id)
        room = f'conv_{conv.id}'
        join_room(room)
        emit('joined', {'conversation_id': conv.id}, room=room)

    @socketio.on('leave', namespace='/inbox')
    @login_required
    def on_leave(data):
        conv_id = data.get('conversation_id')
        room = f'conv_{conv_id}'
        leave_room(room)
        emit('left', {'conversation_id': conv_id})

# Call this during app initialization
def init_app(app):
    app.register_blueprint(inbox_bp)
    register_socket_handlers()
