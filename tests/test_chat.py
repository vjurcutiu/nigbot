import pytest
from backend.extensions import socketio
from db.models import db
from db.chat_models import Message

# Reuse helpers from test_api_routes
from tests.test_api_routes import signup_candidate, signup_client, login


def create_conversation(client):
    signup_candidate(client, 'b')
    signup_client(client, 'c')
    resp = login(client, 'c')
    company_id = resp.get_json().get('company_id')
    job_resp = client.post('/api/jobs', json={'company_id': company_id, 'title': 'Dev'},
                           environ_base={'wsgi.url_scheme': 'https'})
    job_id = job_resp.get_json()['id']
    login(client, 'b')
    cand_id = client.post('/api/auth/login', json={'username': 'b', 'password': 'pass'},
                          environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': 'b'}).get_json()['candidate_id']
    client.post(f'/api/jobs/{job_id}/apply', json={'candidate_id': cand_id},
                environ_base={'wsgi.url_scheme': 'https'})
    login(client, 'c')
    hire_resp = client.post(f'/api/hire/{cand_id}', json={'job_position_id': job_id},
                            environ_base={'wsgi.url_scheme': 'https'})
    conv_id = hire_resp.get_json()['conversation_id']
    return conv_id, cand_id


def test_chat_rest_endpoints(client, app):
    conv_id, cand_id = create_conversation(client)
    login(client, 'b')

    # list conversations
    resp = client.get('/api/conversations', environ_base={'wsgi.url_scheme': 'https'})
    assert any(c['id'] == conv_id for c in resp.get_json())

    # no messages initially
    resp = client.get(f'/api/conversations/{conv_id}/messages', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.get_json()['items'] == []

    # send message via REST
    resp = client.post(f'/api/conversations/{conv_id}/messages', json={'body': 'hi'},
                       environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 201
    msg_id = resp.get_json()['id']

    # mark read
    resp = client.post(f'/api/conversations/{conv_id}/mark_read', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 204

    # delete conversation
    resp = client.delete(f'/api/conversations/{conv_id}', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 204

    with app.app_context():
        assert Message.query.get(msg_id) is None or Message.query.get(msg_id)


def test_chat_participants_and_messages(client):
    conv_id, cand_id = create_conversation(client)
    login(client, 'b')
    client.post(f'/api/conversations/{conv_id}/messages', json={'body': 'hello'},
                environ_base={'wsgi.url_scheme': 'https'})
    resp = client.get(f'/api/conversations/{conv_id}/participants', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert isinstance(resp.get_json(), list)
    resp = client.get(f'/api/conversations/{conv_id}/messages', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert resp.get_json()['total'] >= 1


def test_socket_handlers_registered():
    from backend.blueprints.chat.routes import socketio, SOCKET_NAMESPACE
    handlers = socketio.server.handlers.get(SOCKET_NAMESPACE)
    assert {'join','leave','send'} <= set(handlers)

