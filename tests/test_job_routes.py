import pytest
from tests.test_api_routes import signup_client, signup_candidate, login


def create_company(client, username='emp'):
    signup_client(client, username)
    login(client, username)
    resp = client.post('/api/auth/login', json={'username': username, 'password': 'pass'},
                       environ_base={'wsgi.url_scheme':'https','REMOTE_ADDR': username})
    return resp.get_json()['company_id']


def create_job(client, company_id, **extra):
    resp = client.post('/api/jobs', json={'company_id': company_id, 'title': 'Role', **extra},
                       environ_base={'wsgi.url_scheme':'https'})
    return resp


def test_create_job_errors(client):
    cid = create_company(client)
    resp = client.post('/api/jobs', json={'title': 'NoCompany'}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 500
    resp = client.post('/api/jobs', json={'company_id': 999, 'title': 'Bad'}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 500
    resp = create_job(client, cid)
    assert resp.status_code == 201


def test_job_list_filter_sort_update_delete(client):
    cid = create_company(client, 'empx')
    # create two jobs
    j1 = create_job(client, cid, remote=True).get_json()['id']
    j2 = create_job(client, cid, remote=False).get_json()['id']
    # list filter remote
    resp = client.get('/api/jobs', query_string={'remote':'true'}, environ_base={'wsgi.url_scheme':'https'})
    assert all(job['remote'] for job in resp.get_json()['items'])
    # sort asc
    resp = client.get('/api/jobs', query_string={'sort':'posted_at','order':'asc'}, environ_base={'wsgi.url_scheme':'https'})
    ids = [item['id'] for item in resp.get_json()['items']]
    assert ids == sorted(ids)
    # update
    resp = client.put(f'/api/jobs/{j1}', json={'title':'Updated'}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200 and resp.get_json()['title']=='Updated'
    # delete
    resp = client.delete(f'/api/jobs/{j2}', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 204


def test_duplicate_application(client):
    signup_candidate(client, 'apc')
    cand_id = login(client, 'apc').get_json()['candidate_id']
    cid = create_company(client, 'apemp')
    job_id = create_job(client, cid).get_json()['id']
    resp = client.post(f'/api/jobs/{job_id}/apply', json={'candidate_id': cand_id}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 201
    resp = client.post(f'/api/jobs/{job_id}/apply', json={'candidate_id': cand_id}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 500


