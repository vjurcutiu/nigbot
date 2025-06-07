import pytest
from sqlalchemy.exc import SQLAlchemyError
from db.models import db
from utils.db_services.candidate_service import CandidateProfileService
from utils.db_services.company_service import CompanyService


def test_candidate_service_create_and_update(app):
    user_id = 1
    profile = CandidateProfileService.create_profile(user_id=user_id, full_name='A', email='a@a.com')
    assert profile.id is not None

    updated = CandidateProfileService.update_profile(profile.id, full_name='B')
    assert updated.full_name == 'B'

    assert CandidateProfileService.delete_profile(profile.id)


def test_candidate_service_rollback_on_error(app, monkeypatch):
    called = {"rollback": False}

    def fake_commit():
        raise SQLAlchemyError("boom")

    def fake_rollback():
        called["rollback"] = True

    monkeypatch.setattr(db.session, "commit", fake_commit)
    monkeypatch.setattr(db.session, "rollback", fake_rollback)

    with pytest.raises(SQLAlchemyError):
        CandidateProfileService.create_profile(user_id=2, full_name='C', email='c@c.com')
    assert called["rollback"]


def test_company_service_crud(app):
    company = CompanyService.create_company(user_id=1, name='ACME')
    assert company.id

    company = CompanyService.update_company(company.id, name='NEW')
    assert company.name == 'NEW'

    assert CompanyService.delete_company(company.id)
