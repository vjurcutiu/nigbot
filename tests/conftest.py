import os
import sys
import pytest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, 'backend'))

from backend.app import app as flask_app
from db.models import db

@pytest.fixture
def app():
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'test-secret',
    })
    flask_app._got_first_request = False
    with flask_app.app_context():
        talisman = flask_app.extensions.get('talisman')
        if talisman:
            talisman.force_https = False
            talisman.force_https_permanent = False
        funcs = flask_app.before_request_funcs.get(None, [])
        flask_app.before_request_funcs[None] = [
            f for f in funcs if getattr(f, '__name__', '') != '_force_https'
        ]
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()
