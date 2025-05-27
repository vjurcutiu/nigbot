# blueprints/client/routes.py
from flask import Blueprint, request, jsonify, session
from db.models import Company, JobPosition, db

client_bp = Blueprint('client', __name__)

def client_required(func):
    """Decorator to ensure the user is authenticated as a client."""
    def wrapper(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'client':
            return jsonify({"error": "Unauthorized"}), 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

@client_bp.route('', methods=['GET'])
@client_bp.route('/', methods=['GET'])
@client_required  # ensure user is authenticated as client
def client_dashboard():
    """Client dashboard endpoint returning overview + full company data."""
    print(f"Request to client_dashboard from user_id: {session.get('user_id')}, role: {session.get('role')}")
    # Debug: print all company user_ids in the database
    all_companies = Company.query.all()
    print("All companies user_ids in DB:", [c.user_id for c in all_companies])
    # Lookup the company for the logged-in user
    company = Company.query.filter_by(user_id=session['user_id']).first()
    print(f"Queried company: {company}")
    if not company:
        print("No company found for user_id:", session.get('user_id'))
        return jsonify({
            "message": "No company found",
            "company": None
        }), 404

    # Serialize company and related job positions
    company_data = {
        "id": company.id,
        "name": company.name,
        "address": company.address,
        "contact_email": company.contact_email,
        "contact_phone": company.contact_phone,
        "created_at": company.created_at.isoformat(),
        "updated_at": company.updated_at.isoformat(),
        "job_positions": [
            {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "location": job.location,
                "posted_at": job.posted_at.isoformat()
            }
            for job in company.job_positions
        ]
    }

    overview = {
        "message": "Welcome to the client dashboard",
        "companyId": company.id,
        "company": company_data
    }
    return jsonify(overview)


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

@client_bp.route('/debug/companies', methods=['GET'])
def debug_companies():
    """Debug endpoint to list all companies and their user_ids."""
    companies = Company.query.all()
    companies_data = [{"id": c.id, "user_id": c.user_id, "name": c.name} for c in companies]
    return jsonify({"companies": companies_data})

@client_bp.route('/debug/add_test_company', methods=['POST'])
def debug_add_test_company():
    """Debug endpoint to add a test company for the current user in session."""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "No user_id in session"}), 400

    # Check if company already exists for this user
    existing = Company.query.filter_by(user_id=user_id).first()
    if existing:
        return jsonify({"message": "Company already exists for this user", "company_id": existing.id})

    # Create a test company
    test_company = Company(
        user_id=user_id,
        name=f"Test Company for user {user_id}",
        bio="This is a test company created for debugging.",
        website="https://example.com",
        industry="Technology",
        size="1-10",
        address="123 Test St",
        city="Testville",
        country="Testland",
        contact_email="test@example.com",
        contact_phone="123-456-7890"
    )
    db.session.add(test_company)
    db.session.commit()

    return jsonify({"message": "Test company created", "company_id": test_company.id})

@client_bp.route('/<int:company_id>', methods=['GET'])
@client_required
def get_company(company_id):
    print(f"Request to get_company with company_id: {company_id} from user_id: {session.get('user_id')}")
    """Retrieve full company info (including job positions) by ID."""
    company = Company.query.get(company_id)
    if not company:
        print(f"Company with id {company_id} not found")
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
from db.company_models import Company
from db.models import db
from datetime import datetime

# … assume company_bp and client_required are already defined above …

import traceback
import logging

@client_bp.route('/<int:company_id>', methods=['PATCH'])
@client_required
def update_company(company_id):
    try:
        logging.info(f"Request to update_company with company_id: {company_id} from user_id: {session.get('user_id')}")
        company = Company.query.get(company_id)
        if not company:
            logging.warning(f"Company with id {company_id} not found")
            return jsonify({"error": "Company not found"}), 404

        if company.user_id != session.get('user_id'):
            logging.warning(f"User {session.get('user_id')} forbidden to update company {company_id}")
            return jsonify({"error": "Forbidden"}), 403

        data = request.get_json() or {}
        logging.info(f"Update data received: {data}")

        updatable_fields = {
            "name": str,
            "bio": str,
            "profile_picture": str,
            "website": str,
            "industry": str,
            "size": str,
            "founded_date": "date",
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
                try:
                    if expected == "date":
                        setattr(company, field, datetime.fromisoformat(val).date())
                    else:
                        setattr(company, field, expected(val))
                except Exception as e:
                    errors[field] = f"Invalid value: {e}"

        if errors:
            logging.error(f"Validation errors: {errors}")
            return jsonify({"error": "Validation failed", "details": errors}), 400

        company.updated_at = datetime.utcnow()
        db.session.commit()
        logging.info(f"Company {company_id} updated successfully")

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
    except Exception as e:
        logging.error(f"Exception in update_company: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500
