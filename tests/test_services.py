import pytest
from sqlalchemy.exc import SQLAlchemyError
from datetime import date

from db.models import db
from utils.db_services.candidate_service import (
    CandidateProfileService,
    EmploymentHistoryService,
    LegalDocumentService,
    JobApplicationService,
    SkillService,
    CandidateSkillService,
    EducationService,
)
from utils.db_services.company_service import CompanyService, JobPositionService


def test_candidate_and_company_service_full_flow(app):
    # create candidate profile and company
    profile = CandidateProfileService.create_profile(user_id=1, full_name='A', email='a@a.com')
    company = CompanyService.create_company(user_id=2, name='ACME')

    # employment
    emp = EmploymentHistoryService.create_employment(candidate_id=profile.id,
                                                     company_name='Acme', position='Dev',
                                                     start_date=date.today())
    assert EmploymentHistoryService.get_employment(emp.id)
    EmploymentHistoryService.update_employment(emp.id, position='Lead')

    # legal document
    doc = LegalDocumentService.add_document(candidate_id=profile.id, doc_type='ID', file_path='x')
    assert LegalDocumentService.get_document(doc.id)

    # job and application
    job = JobPositionService.create_job(company_id=company.id, title='Dev')
    app_obj = JobApplicationService.create_application(candidate_id=profile.id, job_position_id=job.id)
    JobApplicationService.update_application(app_obj.id, status='Reviewed')
    job2 = JobPositionService.create_job(company_id=company.id, title='Extra')

    # skills
    skill = SkillService.create_skill('Python')
    CandidateSkillService.add_skill(profile.id, skill.id, proficiency='Expert')

    # education
    edu = EducationService.add_education(candidate_id=profile.id, institution='U')
    EducationService.update_education(edu.id, degree='BS')

    # deletes
    assert CandidateSkillService.remove_skill(profile.id, skill.id)
    assert SkillService.delete_skill(skill.id)
    assert EducationService.delete_education(edu.id)
    assert JobApplicationService.delete_application(app_obj.id)
    JobPositionService.delete_job(job.id)  # may be cascade deleted
    assert JobPositionService.delete_job(job2.id)
    assert LegalDocumentService.delete_document(doc.id)
    assert EmploymentHistoryService.delete_employment(emp.id)
    assert CompanyService.delete_company(company.id)
    assert CandidateProfileService.delete_profile(profile.id)


def test_service_error_handling(app, monkeypatch):
    def boom():
        raise SQLAlchemyError('fail')

    monkeypatch.setattr(db.session, 'commit', boom)
    with pytest.raises(SQLAlchemyError):
        CandidateProfileService.create_profile(user_id=1, full_name='A', email='a')
    with pytest.raises(SQLAlchemyError):
        CompanyService.create_company(user_id=1, name='x')


def test_db_service_returns_and_rollback(app, monkeypatch):
    profile = CandidateProfileService.create_profile(user_id=3, full_name='B', email='b@b.com')
    skill = SkillService.create_skill('SQL')
    cs = CandidateSkillService.add_skill(profile.id, skill.id, proficiency='Adv')
    assert cs.skill_id == skill.id
    assert CandidateSkillService.remove_skill(profile.id, skill.id) is True
    called = {}
    def boom_commit():
        raise SQLAlchemyError('oops')
    def record_rollback():
        called['rollback'] = True
    monkeypatch.setattr(db.session, 'commit', boom_commit)
    monkeypatch.setattr(db.session, 'rollback', record_rollback)
    with pytest.raises(SQLAlchemyError):
        EducationService.add_education(candidate_id=profile.id, institution='U')
    assert called.get('rollback') is True


def test_service_missing_objects(app):
    assert CandidateProfileService.get_profile(9999) is None
    assert CandidateProfileService.update_profile(9999, full_name='x') is None
    assert CandidateProfileService.delete_profile(9999) is False
    assert CompanyService.get_company(9999) is None
    assert CompanyService.update_company(9999, name='y') is None
    assert CompanyService.delete_company(9999) is False
    assert JobPositionService.delete_job(9999) is False


def test_service_additional_missing_branches(app):
    profile = CandidateProfileService.create_profile(user_id=4, full_name='Z', email='z@z.com')
    skill = SkillService.create_skill('Extra')

    # removing a skill that was never added
    assert CandidateSkillService.remove_skill(profile.id, skill.id) is False

    # deleting a non-existent skill
    assert SkillService.delete_skill(9999) is False

    # employment branches
    assert EmploymentHistoryService.update_employment(9999, position='Dev') is None
    assert EmploymentHistoryService.delete_employment(9999) is False

    # application branches
    assert JobApplicationService.update_application(9999, status='New') is None
    assert JobApplicationService.delete_application(9999) is False

    # education branches
    assert EducationService.update_education(9999, degree='PhD') is None
    assert EducationService.delete_education(9999) is False
