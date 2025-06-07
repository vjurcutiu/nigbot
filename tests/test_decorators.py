from blueprints.auth.routes import login_required
from flask import Blueprint, jsonify
import pytest


bp = Blueprint('test', __name__)

@bp.route('/protected')
@login_required
def protected_route():
    return jsonify({'ok': True})


@pytest.fixture
def client_with_bp(app):
    app.register_blueprint(bp, url_prefix='/test')
    return app.test_client()


def test_login_required(client_with_bp):
    client = client_with_bp
    # Without login
    resp = client.get('/test/protected', environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': 'anon'})
    assert resp.status_code == 401

    # Sign up and login
    client.post('/api/auth/signup', json={'username': 'u', 'password': 'p', 'role': 'candidate', 'email': 'u@x.com', 'full_name': 'u'}, environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': 'u'})
    client.post('/api/auth/login', json={'username': 'u', 'password': 'p'}, environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': 'u'})
    resp = client.get('/test/protected', environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': 'u'})
    assert resp.status_code == 200
    assert resp.get_json()['ok'] is True
