from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from db.user_models import User
from db.candidate_models import CandidateProfile, EmploymentHistory, LegalDocument, JobApplication, Skill, CandidateSkill, Education
from db.company_models import Company, JobPosition
