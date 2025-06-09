
import eventlet
eventlet.monkey_patch()

import os
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_talisman import Talisman
from extensions import socketio, login_manager, limiter

from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate

from blueprints.auth.routes import auth_bp
from blueprints.client.routes import client_bp
from blueprints.candidate.routes import candidate_bp
from blueprints.marketplace.routes import marketplace_bp
from blueprints.chat.routes import init_app as chat_init_app
from blueprints.job.routes import job_bp
from blueprints.extra.addon import addon_bp
from blueprints.hire.routes import hire_bp



from db.models import (
    db, CandidateProfile, EmploymentHistory,
    LegalDocument, JobApplication,
    Skill, CandidateSkill, Education, User
)

from datetime import timedelta

app = Flask(__name__)
app.config.update({
    'SECRET_KEY': os.getenv('SECRET_KEY', 'change-this-secret'),
    'SQLALCHEMY_DATABASE_URI': os.getenv('DATABASE_URL', 'sqlite:///myapp.db'),
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'PERMANENT_SESSION_LIFETIME': timedelta(days=7),
    'SESSION_COOKIE_HTTPONLY': True,
    'SESSION_COOKIE_SECURE': True,
    'SESSION_COOKIE_SAMESITE': 'Lax',
})

csrf = CSRFProtect(app)
Talisman(app)
limiter.init_app(app)

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:5174"],
            "allow_headers": ["Content-Type", "Authorization", "X-CSRFToken"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
        },
        r"/socket.io/*": {
            "origins": ["http://localhost:5173", "http://localhost:5174"],
            "allow_headers": ["Content-Type", "Authorization", "X-CSRFToken"],
            "methods": ["GET", "POST", "OPTIONS"]
        }
    }
)

# initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
socketio.init_app(app, cors_allowed_origins="*")
login_manager.init_app(app)

# register blueprints
app.register_blueprint(auth_bp,      url_prefix='/api/auth')
app.register_blueprint(client_bp,    url_prefix='/api/client')
app.register_blueprint(candidate_bp, url_prefix='/api/candidate')
app.register_blueprint(marketplace_bp)
app.register_blueprint(job_bp)  # Register job blueprint without url_prefix to use /api/jobs
app.register_blueprint(addon_bp )
app.register_blueprint(hire_bp)

chat_init_app(app)

@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Provide a CSRF token for API clients."""
    return jsonify({'csrf_token': generate_csrf()})

@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f"Unhandled Exception: {e}", exc_info=True)
    return "Internal Server Error", 500

if __name__ == '__main__':
    # no more db.create_all()
    socketio.run(app, host='127.0.0.1', port=5000, debug=True)
