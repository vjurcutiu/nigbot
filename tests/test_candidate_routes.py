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

