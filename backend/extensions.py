from flask_socketio import SocketIO
from flask_login import LoginManager

socketio = SocketIO(cors_allowed_origins="*", manage_session=True)
login_manager = LoginManager()
