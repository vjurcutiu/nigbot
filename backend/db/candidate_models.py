from backend.db.models import db

class CandidateProfile(db.Model):
    __tablename__ = 'candidate_profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)  # store file path or URL
    summary = db.Column(db.Text, nullable=True)

    user = db.relationship('User', backref=db.backref('candidate_profile', uselist=False))
    employments = db.relationship('EmploymentHistory', backref='candidate', cascade='all, delete-orphan')
    documents = db.relationship('LegalDocument', backref='candidate', cascade='all, delete-orphan')
    applications = db.relationship('JobApplication', backref='candidate', cascade='all, delete-orphan')


class EmploymentHistory(db.Model):
    __tablename__ = 'employment_histories'
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id'), nullable=False)
    company_name = db.Column(db.String(150), nullable=False)
    position = db.Column(db.String(150), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)  # null for current
    description = db.Column(db.Text, nullable=True)


class LegalDocument(db.Model):
    __tablename__ = 'legal_documents'
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id'), nullable=False)
    doc_type = db.Column(db.String(100), nullable=False)  # e.g., 'ID', 'Passport', 'Work Authorization'
    file_path = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())


class JobApplication(db.Model):
    __tablename__ = 'job_applications'
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id'), nullable=False)
    job_title = db.Column(db.String(150), nullable=False)
    company_name = db.Column(db.String(150), nullable=True)
    applied_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    status = db.Column(db.String(50), nullable=False, default='Applied')  # e.g., Applied, Interview, Offer, Rejected
    resume_path = db.Column(db.String(255), nullable=True)
    cover_letter_path = db.Column(db.String(255), nullable=True)


# Optional: Additional tables for skills and education
class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)


class CandidateSkill(db.Model):
    __tablename__ = 'candidate_skills'
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id'), primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id'), primary_key=True)
    proficiency = db.Column(db.String(50), nullable=True)  # e.g., Beginner, Intermediate, Expert


class Education(db.Model):
    __tablename__ = 'educations'
    id = db.Column(db.Integer, primary_key=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate_profiles.id'), nullable=False)
    institution = db.Column(db.String(150), nullable=False)
    degree = db.Column(db.String(150), nullable=True)
    field_of_study = db.Column(db.String(150), nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    description = db.Column(db.Text, nullable=True)
