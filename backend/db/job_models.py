from db.models import db
from datetime import datetime

class JobPosition(db.Model):
    __tablename__ = 'job_positions'
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    requirements = db.Column(db.Text, nullable=True)
    location = db.Column(db.String(150), nullable=True)  # if different from company HQ
    employment_type = db.Column(db.String(50), nullable=True)  # e.g., 'Full-time', 'Part-time', 'Contract'
    remote = db.Column(db.Boolean, nullable=False, default=False)
    
    posted_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    expires_at = db.Column(db.DateTime, nullable=True)

    company = db.relationship('Company', backref=db.backref('job_positions', cascade='all, delete-orphan'))

    def __repr__(self):
        return f"<JobPosition {self.title} @ {self.company.name}>"


class JobApplication(db.Model):
    __tablename__ = 'job_applications'
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id'), nullable=False)
    job_position_id = db.Column(db.Integer, db.ForeignKey('job_positions.id'), nullable=False)
    applied_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    status = db.Column(db.String(50), nullable=False, default='Applied')  # e.g., Applied, Interview, Offer, Rejected
    resume_path = db.Column(db.String(255), nullable=True)
    cover_letter_path = db.Column(db.String(255), nullable=True)

    candidate = db.relationship('CandidateProfile', backref=db.backref('applications', cascade='all, delete-orphan'))
    job_position = db.relationship('JobPosition', backref=db.backref('applications', cascade='all, delete-orphan'))

    def __repr__(self):
        return f"<JobApplication {self.candidate.full_name} applied to {self.job_position.title}>"
