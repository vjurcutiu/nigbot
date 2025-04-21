# blueprints/candidate/routes.py
from flask import Blueprint, request, jsonify, session

candidate_bp = Blueprint('candidate', __name__)

def candidate_required(func):
    """Decorator to ensure the user is authenticated as a candidate."""
    def wrapper(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'candidate':
            return jsonify({"error": "Unauthorized"}), 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

@candidate_bp.route('/', methods=['GET'])
@candidate_required
def candidate_dashboard():
    """Candidate dashboard endpoint."""
    # TODO: Fetch and return candidate-specific overview data
    return jsonify({"message": "Welcome to the candidate dashboard"})

@candidate_bp.route('/profile', methods=['GET'])
@candidate_required
def get_candidate_profile():
    """Endpoint to retrieve candidate profile information."""
    # TODO: Replace with actual profile retrieval logic
    profile = {}
    return jsonify({"profile": profile})

@candidate_bp.route('/apply', methods=['POST'])
@candidate_required
def apply_job():
    """Endpoint for candidates to submit job applications."""
    application = request.json
    # TODO: Process application submission logic
    return jsonify({"status": "Application submitted", "application": application})

@candidate_bp.route('/applications', methods=['GET'])
@candidate_required
def list_applications():
    """Endpoint to retrieve all applications for the logged‑in candidate."""
    user_id = session['user_id']
    # TODO: Replace with real DB lookup, e.g.:
    # applications = Application.query.filter_by(candidate_id=user_id).all()
    applications = [
        # example shape; replace with serialized model data
        {"position": "Frontend Engineer", "company": "Acme Co.", "date_applied": "2025-03-10"},
        {"position": "Backend Developer", "company": "Widgets Inc.", "date_applied": "2025-04-01"},
    ]
    return jsonify({"applications": applications})