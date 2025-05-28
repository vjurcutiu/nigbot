from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from db.user_models import User
from db.candidate_models import CandidateProfile, EmploymentHistory, LegalDocument, Skill, CandidateSkill, Education
from db.company_models import Company
from db.job_models import JobPosition, JobApplication
from db.chat_models import Conversation, Participant, Message
from db.hire_models import Hire
