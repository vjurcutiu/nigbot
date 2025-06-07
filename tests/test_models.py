from db.models import db
from db.user_models import User
from db.candidate_models import CandidateProfile
from db.company_models import Company
from db.job_models import JobPosition, JobApplication


def test_user_password_hashing(app):
    u = User(username='alice', role='candidate')
    u.set_password('secret')
    db.session.add(u)
    db.session.commit()

    assert u.check_password('secret')
    assert not u.check_password('other')


def test_job_application_relationships(app):
    user1 = User(username='client1', role='client')
    user1.set_password('x')
    user2 = User(username='candidate1', role='candidate')
    user2.set_password('y')
    db.session.add_all([user1, user2])
    db.session.commit()

    company = Company(user_id=user1.id, name='ACME')
    candidate = CandidateProfile(user_id=user2.id, full_name='Bob', email='b@b.com')
    db.session.add_all([company, candidate])
    db.session.commit()

    job = JobPosition(company_id=company.id, title='Dev')
    db.session.add(job)
    db.session.commit()

    app_obj = JobApplication(candidate_id=candidate.id, job_position_id=job.id)
    db.session.add(app_obj)
    db.session.commit()

    assert app_obj.job_position is job
    assert app_obj in job.job_applications
