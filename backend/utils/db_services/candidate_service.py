from db.candidate_models import (
    CandidateProfile, EmploymentHistory, LegalDocument,
    JobApplication, Skill, CandidateSkill, Education
)
from db.models import db
from sqlalchemy.exc import SQLAlchemyError


class CandidateProfileService:
    @staticmethod
    def create_profile(user_id: int, **kwargs) -> CandidateProfile:
        """Create a new candidate profile."""
        profile = CandidateProfile(user_id=user_id, **kwargs)
        try:
            db.session.add(profile)
            db.session.commit()
            return profile
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def get_profile(profile_id: int) -> CandidateProfile:
        """Retrieve a candidate profile by ID."""
        return CandidateProfile.query.get(profile_id)

    @staticmethod
    def update_profile(profile_id: int, **kwargs) -> CandidateProfile:
        """Update fields of an existing candidate profile."""
        profile = CandidateProfileService.get_profile(profile_id)
        if not profile:
            return None
        for key, value in kwargs.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        try:
            db.session.commit()
            return profile
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def delete_profile(profile_id: int) -> bool:
        """Delete a candidate profile by ID."""
        profile = CandidateProfileService.get_profile(profile_id)
        if not profile:
            return False
        try:
            db.session.delete(profile)
            db.session.commit()
            return True
        except SQLAlchemyError:
            db.session.rollback()
            raise


class EmploymentHistoryService:
    @staticmethod
    def create_employment(candidate_id: int, **kwargs) -> EmploymentHistory:
        """Add employment history to a candidate."""
        employment = EmploymentHistory(candidate_id=candidate_id, **kwargs)
        try:
            db.session.add(employment)
            db.session.commit()
            return employment
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def get_employment(employment_id: int) -> EmploymentHistory:
        """Retrieve employment history by ID."""
        return EmploymentHistory.query.get(employment_id)

    @staticmethod
    def update_employment(employment_id: int, **kwargs) -> EmploymentHistory:
        """Update an existing employment history entry."""
        emp = EmploymentHistoryService.get_employment(employment_id)
        if not emp:
            return None
        for key, value in kwargs.items():
            if hasattr(emp, key):
                setattr(emp, key, value)
        try:
            db.session.commit()
            return emp
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def delete_employment(employment_id: int) -> bool:
        """Delete an employment history entry."""
        emp = EmploymentHistoryService.get_employment(employment_id)
        if not emp:
            return False
        try:
            db.session.delete(emp)
            db.session.commit()
            return True
        except SQLAlchemyError:
            db.session.rollback()
            raise


class LegalDocumentService:
    @staticmethod
    def add_document(candidate_id: int, **kwargs) -> LegalDocument:
        """Upload a legal document for a candidate."""
        doc = LegalDocument(candidate_id=candidate_id, **kwargs)
        try:
            db.session.add(doc)
            db.session.commit()
            return doc
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def get_document(doc_id: int) -> LegalDocument:
        return LegalDocument.query.get(doc_id)

    @staticmethod
    def delete_document(doc_id: int) -> bool:
        doc = LegalDocumentService.get_document(doc_id)
        if not doc:
            return False
        try:
            db.session.delete(doc)
            db.session.commit()
            return True
        except SQLAlchemyError:
            db.session.rollback()
            raise


class JobApplicationService:
    @staticmethod
    def create_application(candidate_id: int, **kwargs) -> JobApplication:
        """Create a job application record."""
        app = JobApplication(candidate_id=candidate_id, **kwargs)
        try:
            db.session.add(app)
            db.session.commit()
            return app
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def get_application(app_id: int) -> JobApplication:
        return JobApplication.query.get(app_id)

    @staticmethod
    def update_application(app_id: int, **kwargs) -> JobApplication:
        app = JobApplicationService.get_application(app_id)
        if not app:
            return None
        for key, value in kwargs.items():
            if hasattr(app, key):
                setattr(app, key, value)
        try:
            db.session.commit()
            return app
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def delete_application(app_id: int) -> bool:
        app = JobApplicationService.get_application(app_id)
        if not app:
            return False
        try:
            db.session.delete(app)
            db.session.commit()
            return True
        except SQLAlchemyError:
            db.session.rollback()
            raise


class SkillService:
    @staticmethod
    def create_skill(name: str) -> Skill:
        skill = Skill(name=name)
        try:
            db.session.add(skill)
            db.session.commit()
            return skill
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def get_skill(skill_id: int) -> Skill:
        return Skill.query.get(skill_id)

    @staticmethod
    def delete_skill(skill_id: int) -> bool:
        skill = SkillService.get_skill(skill_id)
        if not skill:
            return False
        try:
            db.session.delete(skill)
            db.session.commit()
            return True
        except SQLAlchemyError:
            db.session.rollback()
            raise


class CandidateSkillService:
    @staticmethod
    def add_skill(candidate_id: int, skill_id: int, proficiency: str = None) -> CandidateSkill:
        cs = CandidateSkill(candidate_id=candidate_id, skill_id=skill_id, proficiency=proficiency)
        try:
            db.session.add(cs)
            db.session.commit()
            return cs
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def remove_skill(candidate_id: int, skill_id: int) -> bool:
        cs = CandidateSkill.query.get((candidate_id, skill_id))
        if not cs:
            return False
        try:
            db.session.delete(cs)
            db.session.commit()
            return True
        except SQLAlchemyError:
            db.session.rollback()
            raise


class EducationService:
    @staticmethod
    def add_education(candidate_id: int, **kwargs) -> Education:
        edu = Education(candidate_id=candidate_id, **kwargs)
        try:
            db.session.add(edu)
            db.session.commit()
            return edu
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def get_education(edu_id: int) -> Education:
        return Education.query.get(edu_id)

    @staticmethod
    def update_education(edu_id: int, **kwargs) -> Education:
        edu = EducationService.get_education(edu_id)
        if not edu:
            return None
        for key, value in kwargs.items():
            if hasattr(edu, key):
                setattr(edu, key, value)
        try:
            db.session.commit()
            return edu
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def delete_education(edu_id: int) -> bool:
        edu = EducationService.get_education(edu_id)
        if not edu:
            return False
        try:
            db.session.delete(edu)
            db.session.commit()
            return True
        except SQLAlchemyError:
            db.session.rollback()
            raise
