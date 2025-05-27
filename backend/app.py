from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

from blueprints.auth.routes import auth_bp
from blueprints.client.routes import client_bp
from blueprints.candidate.routes import candidate_bp
from blueprints.marketplace.routes import marketplace_bp
from blueprints.chat.routes import init_app as chat_init_app
from blueprints.job.routes import job_bp
from extensions import socketio, login_manager


from db.models import (
    db, CandidateProfile, EmploymentHistory,
    LegalDocument, JobApplication,
    Skill, CandidateSkill, Education, User
)

from datetime import timedelta

app = Flask(__name__)
app.config.update({
    'SECRET_KEY': 'your-secret-key',
    'SQLALCHEMY_DATABASE_URI': 'sqlite:///myapp.db',
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'PERMANENT_SESSION_LIFETIME': timedelta(days=7),
})

CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:5174"],
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
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

chat_init_app(app)

if __name__ == '__main__':
    # no more db.create_all()
    socketio.run(app, debug=True)
