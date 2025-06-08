from tests.test_api_routes import signup_candidate, signup_client, login


def test_candidate_full_profile_endpoints(client):
    signup_candidate(client, 'cand1')
    login(client, 'cand1')
    # fetch own candidate id from login response
    cand_id = client.post('/api/auth/login', json={'username':'cand1','password':'pass'},
                          environ_base={'wsgi.url_scheme':'https','REMOTE_ADDR':'cand1'}).get_json()['candidate_id']

    resp = client.get(f'/api/candidate/{cand_id}/full', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert resp.get_json()['profile']['id'] == cand_id

    # patch profile
    resp = client.patch(f'/api/candidate/{cand_id}/full', json={'profile': {'full_name': 'Updated'}},
                        environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200

    resp = client.get(f'/api/candidate/{cand_id}/full', environ_base={'wsgi.url_scheme':'https'})
    assert resp.get_json()['profile']['full_name'] == 'Updated'

    # apply job (dummy endpoint)
    resp = client.post('/api/candidate/apply', json={'job_id': 1}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert resp.get_json()['status'] == 'Application submitted'

    # list applications (dummy data)
    resp = client.get('/api/candidate/applications', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert isinstance(resp.get_json()['applications'], list)



def test_candidate_required_unauthorized(client):
    # Attempt to access candidate dashboard without login
    resp = client.get('/api/candidate/profile', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 401


def test_candidate_public_private_and_patch(client, app):
    signup_candidate(client, 'cand2')
    login(client, 'cand2')
    cand_id = client.post('/api/auth/login', json={'username':'cand2','password':'pass'},
                          environ_base={'wsgi.url_scheme':'https','REMOTE_ADDR':'cand2'}).get_json()['candidate_id']
    # Public endpoint accessible
    resp = client.get(f'/api/candidate/{cand_id}/full/public', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert resp.get_json()['profile']['id'] == cand_id
    # Private endpoint requires candidate role
    resp = client.get(f'/api/candidate/{cand_id}/full', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200

    # Prepare skills and patch summary and skills
    with app.app_context():
        from db.candidate_models import Skill, CandidateSkill, CandidateProfile
        from db.models import db
        candidate = CandidateProfile.query.get(cand_id)
        skill1 = Skill(name='Python')
        skill2 = Skill(name='Go')
        db.session.add_all([skill1, skill2])
        db.session.commit()
        candidate.candidate_skills.append(CandidateSkill(skill_id=skill1.id, proficiency='Beginner'))
        db.session.commit()
        skill1_id = skill1.id
        skill2_id = skill2.id
    resp = client.patch(
        f'/api/candidate/{cand_id}/full',
        json={'profile': {'summary': '<b>Hello</b><script>bad()</script>'},
              'skills': [
                  {'skill_id': skill1_id, 'proficiency': 'Intermediate'},
                  {'skill_id': skill2_id, 'proficiency': 'Expert'}]},
        environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    resp = client.get(f'/api/candidate/{cand_id}/full', environ_base={'wsgi.url_scheme':'https'})
    data = resp.get_json()
    assert data['profile']['summary'] == '<b>Hello</b>bad()'
    skill_ids = {s['skill_id']: s['proficiency'] for s in data['skills']}
    assert skill_ids[skill1_id] == 'Intermediate'
    assert skill_ids[skill2_id] == 'Expert'

