from db.company_models import Company, JobPosition
from db.models import db
from sqlalchemy.exc import SQLAlchemyError

class CompanyService:
    @staticmethod
    def create_company(user_id: int, **kwargs) -> Company:
        """Create a new company."""
        company = Company(user_id=user_id, **kwargs)
        try:
            db.session.add(company)
            db.session.commit()
            return company
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_company(company_id: int) -> Company:
        """Retrieve a company by ID."""
        return Company.query.get(company_id)

    @staticmethod
    def update_company(company_id: int, **kwargs) -> Company:
        """Update fields of an existing company."""
        company = CompanyService.get_company(company_id)
        if not company:
            return None
        for key, value in kwargs.items():
            if hasattr(company, key):
                setattr(company, key, value)
        try:
            db.session.commit()
            return company
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_company(company_id: int) -> bool:
        """Delete a company by ID."""
        company = CompanyService.get_company(company_id)
        if not company:
            return False
        try:
            db.session.delete(company)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

class JobPositionService:
    @staticmethod
    def create_job(company_id: int, **kwargs) -> JobPosition:
        """Create a new job position for a company."""
        job = JobPosition(company_id=company_id, **kwargs)
        try:
            db.session.add(job)
            db.session.commit()
            return job
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def get_job(job_id: int) -> JobPosition:
        """Retrieve a job position by ID."""
        return JobPosition.query.get(job_id)

    @staticmethod
    def update_job(job_id: int, **kwargs) -> JobPosition:
        """Update fields of an existing job position."""
        job = JobPositionService.get_job(job_id)
        if not job:
            return None
        for key, value in kwargs.items():
            if hasattr(job, key):
                setattr(job, key, value)
        try:
            db.session.commit()
            return job
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e

    @staticmethod
    def delete_job(job_id: int) -> bool:
        """Delete a job position by ID."""
        job = JobPositionService.get_job(job_id)
        if not job:
            return False
        try:
            db.session.delete(job)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            raise e
