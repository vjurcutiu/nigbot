# blueprints/client/routes.py
from flask import Blueprint, request, jsonify, session
from backend.db.company_models import Company, JobPosition
from backend.db.models import db

client_bp = Blueprint('client', __name__)

def client_required(func):
    """Decorator to ensure the user is authenticated as a client."""
    def wrapper(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'client':
            return jsonify({"error": "Unauthorized"}), 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

@client_bp.route('/', methods=['GET'])
@client_required
def client_dashboard():
    """Client dashboard endpoint."""
    # TODO: Fetch and return client-specific overview data
    return jsonify({"message": "Welcome to the client dashboard"})

@client_bp.route('/data', methods=['GET'])
@client_required
def get_client_data():
    """Endpoint to retrieve client data."""
    # TODO: Replace with actual data retrieval logic
    sample_data = []
    return jsonify({"data": sample_data})

@client_bp.route('/action', methods=['POST'])
@client_required
def client_action():
    """Endpoint for performing client-specific actions."""
    payload = request.json
    # TODO: Handle client action based on payload
    return jsonify({"status": "Action received", "payload": payload})

@client_bp.route('/<int:company_id>', methods=['GET'])
@client_required
def get_company(company_id):
    """Retrieve full company info (including job positions) by ID."""
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error": "Company not found"}), 404

    # Serialize the company
    company_data = {
        "id": company.id,
        "user_id": company.user_id,
        "name": company.name,
        "bio": company.bio,
        "profile_picture": company.profile_picture,
        "website": company.website,
        "industry": company.industry,
        "size": company.size,
        "founded_date": company.founded_date.isoformat() if company.founded_date else None,
        "address": company.address,
        "city": company.city,
        "country": company.country,
        "latitude": company.latitude,
        "longitude": company.longitude,
        "contact_email": company.contact_email,
        "contact_phone": company.contact_phone,
        "created_at": company.created_at.isoformat(),
        "updated_at": company.updated_at.isoformat(),
        "job_positions": []
    }

    # Include related job positions
    for job in company.job_positions:
        company_data["job_positions"].append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "requirements": job.requirements,
            "location": job.location,
            "employment_type": job.employment_type,
            "remote": job.remote,
            "posted_at": job.posted_at.isoformat(),
            "expires_at": job.expires_at.isoformat() if job.expires_at else None
        })

    return jsonify(company_data), 200

# routes.py (continuing in the same file/blueprint)

from flask import Blueprint, request, jsonify, session
from backend.db.company_models import Company
from backend.db.models import db
from datetime import datetime

# … assume company_bp and client_required are already defined above …

@client_bp.route('/<int:company_id>', methods=['PATCH'])
@client_required
def update_company(company_id):
    """Update allowed fields on a Company record."""
    company = Company.query.get(company_id)
    if not company:
        return jsonify({"error": "Company not found"}), 404

    # Ensure the current client owns this company
    if company.user_id != session.get('user_id'):
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json() or {}

    # Define which fields may be updated
    updatable_fields = {
        "name": str,
        "bio": str,
        "profile_picture": str,
        "website": str,
        "industry": str,
        "size": str,
        "founded_date": "date",      # expects YYYY-MM-DD
        "address": str,
        "city": str,
        "country": str,
        "latitude": float,
        "longitude": float,
        "contact_email": str,
        "contact_phone": str,
    }

    errors = {}
    for field, expected in updatable_fields.items():
        if field in data:
            val = data[field]
            # simple type/check guard
            try:
                if expected == "date":
                    # parse date strings
                    setattr(company, field, datetime.fromisoformat(val).date())
                else:
                    setattr(company, field, expected(val))
            except Exception as e:
                errors[field] = f"Invalid value: {e}"

    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    company.updated_at = datetime.utcnow()
    db.session.commit()

    # Return the updated record
    return jsonify({
        "id": company.id,
        "name": company.name,
        "bio": company.bio,
        "profile_picture": company.profile_picture,
        "website": company.website,
        "industry": company.industry,
        "size": company.size,
        "founded_date": company.founded_date.isoformat() if company.founded_date else None,
        "address": company.address,
        "city": company.city,
        "country": company.country,
        "latitude": company.latitude,
        "longitude": company.longitude,
        "contact_email": company.contact_email,
        "contact_phone": company.contact_phone,
        "created_at": company.created_at.isoformat(),
        "updated_at": company.updated_at.isoformat(),
    }), 200
