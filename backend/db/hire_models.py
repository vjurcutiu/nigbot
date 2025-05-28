from db.models import db
from datetime import datetime

class Hire(db.Model):
    __tablename__ = 'hires'
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id'), nullable=False)
    job_position_id = db.Column(db.Integer, db.ForeignKey('job_positions.id'), nullable=True)
    hired_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False, default='active')

    client = db.relationship('User', backref='hires')
    candidate = db.relationship('CandidateProfile', backref='hires')
    job_position = db.relationship('JobPosition', backref='hires')
