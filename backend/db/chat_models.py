from datetime import datetime
from db.models import db

class Conversation(db.Model):
    __tablename__ = "conversations"
    id = db.Column(db.Integer, primary_key=True)
    # For a group inbox, you could have a separate participants table
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Participant(db.Model):
    __tablename__ = "participants"
    conversation_id = db.Column(
        db.Integer, db.ForeignKey("conversations.id"), primary_key=True)
    user_id = db.Column(db.Integer, primary_key=True)
    # track last‐read timestamp for unread counts
    last_read = db.Column(db.DateTime, default=datetime.utcnow)

class Message(db.Model):
    __tablename__ = "messages"
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(
        db.Integer, db.ForeignKey("conversations.id"), index=True)
    sender_id = db.Column(db.Integer)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
