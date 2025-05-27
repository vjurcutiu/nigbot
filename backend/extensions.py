from flask_socketio import SocketIO
from flask_login import LoginManager

socketio = SocketIO(cors_allowed_origins="*")
login_manager = LoginManager()
