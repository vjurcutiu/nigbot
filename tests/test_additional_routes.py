from tests.test_api_routes import signup_candidate, signup_client, login
import pytest


def test_client_dashboard_requires_login(client):
    resp = client.get('/api/client/', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 401


def test_get_company_not_found(client):
    signup_client(client, 'missingco')
    login(client, 'missingco')
    resp = client.get('/api/client/9999', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 404


def test_hire_candidate_unauthorized(client):
    resp = client.post('/api/hire/1', json={'job_position_id': 1}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 401


def test_hire_candidate_not_found(client):
    signup_client(client, 'hireco')
    login(client, 'hireco')
    resp = client.post('/api/hire/9999', json={'job_position_id': 1}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 404


def test_get_job_not_found(client):
    resp = client.get('/api/jobs/9999', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 500


def test_apply_candidate_not_found(client):
    signup_client(client, 'jobco')
    login(client, 'jobco')
    cid = client.post('/api/auth/login', json={'username':'jobco','password':'pass'},
                      environ_base={'wsgi.url_scheme':'https','REMOTE_ADDR':'jobco'}).get_json()['company_id']
    job_id = client.post('/api/jobs', json={'company_id': cid, 'title': 'Role'},
                         environ_base={'wsgi.url_scheme':'https'}).get_json()['id']
    resp = client.post(f'/api/jobs/{job_id}/apply', json={'candidate_id': 9999},
                       environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 500


def test_job_update_not_found(client):
    resp = client.put('/api/jobs/9999', json={'title':'x'}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 500


def test_marketplace_error_handling(client, monkeypatch):
    from backend.blueprints.marketplace import routes as mp
    class DummyQuery:
        def with_entities(self, *a, **k):
            raise Exception('fail')
    monkeypatch.setattr(mp.Company, 'query', DummyQuery())
    resp = client.get('/api/marketplace/companies', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 500

