from tests.test_api_routes import login, signup_candidate


def test_csrf_token_endpoint(client):
    signup_candidate(client, 'tok')
    login(client, 'tok')
    resp = client.get('/api/csrf-token', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert 'csrf_token' in resp.get_json()

