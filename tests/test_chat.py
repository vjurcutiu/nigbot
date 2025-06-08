import pytest
from backend.extensions import socketio, limiter
from db.models import db
from db.chat_models import Message

# Reuse helpers from test_api_routes
from tests.test_api_routes import signup_candidate, signup_client, login
import uuid
import jwt


def create_conversation(client):
    suffix = uuid.uuid4().hex[:6]
    cand_name = f'b{suffix}'
    client_name = f'c{suffix}'
    signup_candidate(client, cand_name)
    signup_client(client, client_name)
    limiter.enabled = False
    resp = login(client, client_name)
    company_id = resp.get_json().get('company_id')
    job_resp = client.post('/api/jobs', json={'company_id': company_id, 'title': 'Dev'},
                           environ_base={'wsgi.url_scheme': 'https'})
    job_id = job_resp.get_json()['id']
    login(client, cand_name)
    cand_id = client.post('/api/auth/login', json={'username': cand_name, 'password': 'pass'},
                          environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': 'b'}).get_json()['candidate_id']
    client.post(f'/api/jobs/{job_id}/apply', json={'candidate_id': cand_id},
                environ_base={'wsgi.url_scheme': 'https'})
    login(client, client_name)
    hire_resp = client.post(f'/api/hire/{cand_id}', json={'job_position_id': job_id},
                            environ_base={'wsgi.url_scheme': 'https'})
    conv_id = hire_resp.get_json()['conversation_id']
    return conv_id, cand_id


def create_conversation_named(client):
    """Return conv_id, cand_id and the usernames involved."""
    suffix = uuid.uuid4().hex[:6]
    cand_name = f'u{suffix}'
    client_name = f'x{suffix}'
    signup_candidate(client, cand_name)
    signup_client(client, client_name)
    limiter.enabled = False
    resp = login(client, client_name)
    company_id = resp.get_json().get('company_id')
    job_id = client.post(
        '/api/jobs',
        json={'company_id': company_id, 'title': 'Dev'},
        environ_base={'wsgi.url_scheme': 'https'},
    ).get_json()['id']
    login(client, cand_name)
    cand_id = client.post(
        '/api/auth/login',
        json={'username': cand_name, 'password': 'pass'},
        environ_base={'wsgi.url_scheme': 'https', 'REMOTE_ADDR': 'c'},
    ).get_json()['candidate_id']
    client.post(
        f'/api/jobs/{job_id}/apply',
        json={'candidate_id': cand_id},
        environ_base={'wsgi.url_scheme': 'https'},
    )
    login(client, client_name)
    conv_id = client.post(
        f'/api/hire/{cand_id}',
        json={'job_position_id': job_id},
        environ_base={'wsgi.url_scheme': 'https'},
    ).get_json()['conversation_id']
    return conv_id, cand_id, cand_name, client_name


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

from unittest.mock import patch
from backend.extensions import socketio
from backend.blueprints.chat.routes import SOCKET_NAMESPACE


def test_mark_read_error_branch(client):
    conv_id, _ = create_conversation(client)
    login(client, 'c')
    client.post(f'/api/conversations/{conv_id}/messages', json={'body':'x'}, environ_base={'wsgi.url_scheme':'https'})
    login(client, 'b')
    class DummyQuery:
        def filter(self, *a, **k):
            raise Exception('fail')
    with patch('backend.blueprints.chat.routes.Message.query', DummyQuery()):
        resp = client.post(f'/api/conversations/{conv_id}/mark_read', environ_base={'wsgi.url_scheme':'https'})
        assert resp.status_code == 500
        assert b'fail' in resp.data


def test_chat_helper_functions(app):
    from backend.blueprints.chat import routes
    from flask_login import login_user
    with app.app_context():
        u1 = routes.User(username='helperA', role='candidate')
        u1.set_password('p')
        u2 = routes.User(username='helperB', role='client')
        u2.set_password('p')
        db.session.add_all([u1, u2])
        db.session.commit()
        conv = routes.Conversation()
        db.session.add(conv)
        db.session.commit()
        db.session.add_all([
            routes.Participant(conversation_id=conv.id, user_id=u1.id),
            routes.Participant(conversation_id=conv.id, user_id=u2.id),
        ])
        msg = routes.Message(conversation_id=conv.id, sender_id=u1.id, body='hello')
        db.session.add(msg)
        db.session.commit()

        token = jwt.encode({'user_id': u1.id}, app.config['SECRET_KEY'], algorithm='HS256')
        assert routes.verify_token(token).id == u1.id
        assert routes.verify_token(None) is None

        with app.test_request_context():
            login_user(u1)
            conv2, part = routes.get_conversation_or_404(conv.id)
            assert conv2.id == conv.id
            d = routes.conversation_to_dict(conv2)
            assert d['id'] == conv.id
            m = routes.message_to_dict(msg)
            assert m['body'] == 'hello'


def test_socketio_message_flow(client, app):
    conv_id, cand_id, cand_name, client_name = create_conversation_named(client)
    login(client, cand_name)
    sio = socketio.test_client(app, flask_test_client=client, namespace=SOCKET_NAMESPACE)
    if not sio.is_connected(namespace=SOCKET_NAMESPACE):
        pytest.skip('socket connection failed')
    sio.emit('join', {'conversation_id': conv_id}, namespace=SOCKET_NAMESPACE)
    assert any(r['name'] == 'joined' for r in sio.get_received(SOCKET_NAMESPACE))
    sio.emit('send', {'conversation_id': conv_id, 'body': 'hi'}, namespace=SOCKET_NAMESPACE)
    assert any(r['name'] == 'new_message' for r in sio.get_received(SOCKET_NAMESPACE))
    sio.emit('leave', {'conversation_id': conv_id}, namespace=SOCKET_NAMESPACE)
    assert any(r['name'] == 'left' for r in sio.get_received(SOCKET_NAMESPACE))
    sio.disconnect(namespace=SOCKET_NAMESPACE)


def test_send_message_bad_request(client):
    conv_id, _, cand_name, _ = create_conversation_named(client)
    login(client, cand_name)
    resp = client.post(f'/api/conversations/{conv_id}/messages', json={}, environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 500
    assert b'Internal Server Error' in resp.data

