from flask import Flask
from flask_cors import CORS
from blueprints.auth.routes import auth_bp
from blueprints.client.routes import client_bp
from blueprints.candidate.routes import candidate_bp
from db.models import db
from db.user_models import User
from db.candidate_models import CandidateProfile, EmploymentHistory, LegalDocument, JobApplication, Skill, CandidateSkill, Education

app = Flask(__name__)
app.config.update({
    'SECRET_KEY': 'your-secret-key',
    'SQLALCHEMY_DATABASE_URI': 'sqlite:///myapp.db',    # or your real DB URI
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
})
CORS(
    app,
    supports_credentials=True,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:5174"],
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    }
)

db.init_app(app)

# register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(client_bp, url_prefix='/api/client')
app.register_blueprint(candidate_bp, url_prefix='/api/candidate')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
