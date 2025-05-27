import logging
from flask import Blueprint, jsonify
from db.company_models import Company
from db.models import CandidateProfile, db
from db.job_models import JobPosition

logger = logging.getLogger(__name__)

marketplace_bp = Blueprint('marketplace', __name__, url_prefix='/api/marketplace')

@marketplace_bp.route('/companies', methods=['GET'])
def list_companies():
    """Return list of all companies with only id, name and bio."""
    try:
        companies = Company.query.with_entities(
            Company.id, Company.name, Company.bio
        ).all()
        data = [{"id": c.id, "name": c.name, "bio": c.bio} for c in companies]
        logger.info(f"Retrieved {len(data)} companies for marketplace")
        return jsonify({"companies": data}), 200
    except Exception as e:
        logger.exception("Failed to load companies for marketplace")
        return jsonify({"error": "Internal server error"}), 500

@marketplace_bp.route('/candidates', methods=['GET'])
def list_candidates():
    """Return list of all candidates with only id, full_name and summary (bio)."""
    try:
        candidates = CandidateProfile.query.with_entities(
            CandidateProfile.id,
            CandidateProfile.full_name,
            CandidateProfile.summary
        ).all()
        data = [
            {"id": c.id, "full_name": c.full_name, "bio": c.summary}
            for c in candidates
        ]
        logger.info(f"Retrieved {len(data)} candidates for marketplace")
        return jsonify({"candidates": data}), 200
    except Exception as e:
        logger.exception("Failed to load candidates for marketplace")
        return jsonify({"error": "Internal server error"}), 500

@marketplace_bp.route('/jobs', methods=['GET'])
def list_jobs():
    """Return list of all jobs with selected fields."""
    try:
        jobs = JobPosition.query.join(JobPosition.company).with_entities(
            JobPosition.id,
            JobPosition.title,
            JobPosition.location,
            JobPosition.employment_type,
            JobPosition.remote,
            JobPosition.posted_at,
            Company.name.label('company_name')
        ).all()
        data = [
            {
                "id": j.id,
                "title": j.title,
                "location": j.location,
                "employment_type": j.employment_type,
                "remote": j.remote,
                "posted_at": j.posted_at.isoformat() if j.posted_at else None,
                "company_name": j.company_name
            }
            for j in jobs
        ]
        logger.info(f"Retrieved {len(data)} jobs for marketplace")
        return jsonify({"jobs": data}), 200
    except Exception as e:
        logger.exception("Failed to load jobs for marketplace")
        return jsonify({"error": "Internal server error"}), 500
