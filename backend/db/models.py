from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from backend.db.user_models import User
from backend.db.candidate_models import CandidateProfile, EmploymentHistory, LegalDocument, JobApplication, Skill, CandidateSkill, Education
from backend.db.company_models import Company, JobPosition
