from backend.extensions import socketio, login_manager, limiter
from flask_socketio import SocketIO
from flask_login import LoginManager
from flask_limiter import Limiter

from utils.security import sanitize_html


def test_extensions_types():
    assert isinstance(socketio, SocketIO)
    assert isinstance(login_manager, LoginManager)
    assert isinstance(limiter, Limiter)


def test_sanitize_html():
    dirty = '<script>alert(1)</script><b>bold</b><a href="https://x.com" onclick="evil()">link</a>'
    clean = sanitize_html(dirty)
    assert '<script>' not in clean
    assert '<b>bold</b>' in clean
    assert 'onclick' not in clean
    assert 'href="https://x.com"' in clean
