from tests.test_api_routes import login, signup_candidate


def test_csrf_token_endpoint(client):
    signup_candidate(client, 'tok')
    login(client, 'tok')
    resp = client.get('/api/csrf-token', environ_base={'wsgi.url_scheme':'https'})
    assert resp.status_code == 200
    assert 'csrf_token' in resp.get_json()


def test_csrf_extension(app):
    assert 'csrf' in app.extensions


def test_error_handler_logs(client, app, caplog):
    from flask import Blueprint

    bp = Blueprint('err2', __name__)

    @bp.route('/fail')
    def fail():
        raise RuntimeError('oops')

    app.register_blueprint(bp, url_prefix='/err2')
    caplog.set_level('ERROR')
    resp = client.get('/err2/fail', environ_base={'wsgi.url_scheme': 'https'})
    assert resp.status_code == 500
    assert 'Internal Server Error' in resp.get_data(as_text=True)
    assert any('Unhandled Exception' in r.message for r in caplog.records)

