from flask_socketio import SocketIO
from flask_login import LoginManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

socketio = SocketIO(cors_allowed_origins="*", manage_session=True)
login_manager = LoginManager()
limiter = Limiter(key_func=get_remote_address)
