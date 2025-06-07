import pytest
from backend.extensions import socketio

# Helpers

def signup_candidate(client, username='cand', password='pass'):
    return client.post(
        '/api/auth/signup',
        json={'username': username, 'password': password, 'role': 'candidate',
              'email': f'{username}@x.com', 'full_name': username},
        environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': username}
    )

def signup_client(client, username='client', password='pass'):
    return client.post(
        '/api/auth/signup',
        json={'username': username, 'password': password, 'role': 'client',
              'company_name': f'{username}Co'},
        environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': username}
    )

def login(client, username, password='pass'):
    return client.post(
        '/api/auth/login',
        json={'username': username, 'password': password},
        environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': username}
    )


def test_candidate_and_client_routes(client):
    signup_candidate(client, 'alice')
    signup_client(client, 'acme')

    # candidate login
    resp = login(client, 'alice')
    cand_data = resp.get_json()
    assert cand_data['role'] == 'candidate'
    cand_id = cand_data.get('candidate_id')

    resp = client.get('/api/candidate/profile', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 200
    assert resp.get_json()['profile']['full_name'] == 'alice'

    resp = client.get('/api/candidate/', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 200

    # client login and dashboard
    login(client, 'acme')
    resp = client.get('/api/client/', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code in (200, 404)

    # marketplace lists should include created records
    resp = client.get('/api/marketplace/candidates', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 200
    assert any(c['id'] == cand_id for c in resp.get_json()['candidates'])

def test_job_post_and_hire_flow(client, app):
    signup_candidate(client, 'bob')
    signup_client(client, 'globex')

    # client login create job
    resp = login(client, 'globex')
    company_id = resp.get_json().get('company_id')
    assert company_id
    job_resp = client.post('/api/jobs', json={'company_id': company_id, 'title': 'Dev'},
                           environ_base={'wsgi.url_scheme': 'https'})
    assert job_resp.status_code == 201
    job_id = job_resp.get_json()['id']

    # candidate apply
    resp = login(client, 'bob')
    cand_id = resp.get_json()['candidate_id']
    apply_resp = client.post(f'/api/jobs/{job_id}/apply', json={'candidate_id': cand_id},
                             environ_base={'wsgi.url_scheme': 'https'})
    assert apply_resp.status_code == 201

    # client hires candidate
    login(client, 'globex')
    hire_resp = client.post(f'/api/hire/{cand_id}', json={'job_position_id': job_id},
                            environ_base={'wsgi.url_scheme': 'https'})
    assert hire_resp.status_code == 201
    conv_id = hire_resp.get_json()['conversation_id']

    # candidate sees conversation
    login(client, 'bob')
    convs = client.get('/api/conversations', environ_base={'wsgi.url_scheme': 'https'})
    assert convs.status_code == 200
    assert any(c['id'] == conv_id for c in convs.get_json())

    # socket.io connection test skipped if server not initialized

from flask import Blueprint

err_bp = Blueprint('err', __name__)

@err_bp.route('/boom')
def boom():
    raise RuntimeError('boom')

@pytest.fixture
def error_client(app):
    app.register_blueprint(err_bp, url_prefix='/test')
    return app.test_client()

def test_global_error_handler(error_client):
    resp = error_client.get('/test/boom', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 500
    assert b'Internal Server Error' in resp.data


def test_marketplace_endpoints(client):
    signup_candidate(client, 'mark')
    signup_client(client, 'mega')
    resp = login(client, 'mega')
    company_id = resp.get_json().get('company_id')
    client.post('/api/jobs', json={'company_id': company_id, 'title': 'Engineer'},
                environ_base={'wsgi.url_scheme': 'https'})

    resp = client.get('/api/marketplace/companies', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 200
    assert any(c['id'] == company_id for c in resp.get_json()['companies'])

    resp = client.get('/api/marketplace/jobs', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 200
    assert any(j['company_name'] for j in resp.get_json()['jobs'])
