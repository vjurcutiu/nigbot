from flask import session
from db.models import db
from db.user_models import User


def signup(client, username='user1', password='pass', role='candidate'):
    return client.post(
        '/api/auth/signup',
        json={'username': username, 'password': password, 'role': role, 'email': f'{username}@x.com', 'full_name': username},
        environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': username},
        follow_redirects=True
    )


def login(client, username='user1', password='pass'):
    return client.post(
        '/api/auth/login',
        json={'username': username, 'password': password},
        environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': username},
        follow_redirects=True
    )


def test_signup_login_logout_flow(client):
    resp = signup(client)
    assert resp.status_code == 201

    resp = login(client)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['role'] == 'candidate'

    resp = client.get('/api/auth/me', environ_base={'wsgi.url_scheme': 'https'}, follow_redirects=True)
    assert resp.status_code == 200
    assert resp.get_json()['username'] == 'user1'

    resp = client.post('/api/auth/logout', environ_base={'wsgi.url_scheme': 'https'}, follow_redirects=True)
    assert resp.status_code == 200

    resp = client.get('/api/auth/me', environ_base={'wsgi.url_scheme': 'https'}, follow_redirects=True)
    assert resp.status_code == 401


def test_invalid_login(client):
    signup(client, username='user2')
    resp = client.post('/api/auth/login', json={'username': 'user2', 'password': 'wrong'}, environ_base={'wsgi.url_scheme': 'https'}, follow_redirects=True)
    assert resp.status_code == 401
