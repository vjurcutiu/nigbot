from flask import Blueprint, request, jsonify, abort
from sqlalchemy import or_, desc
from datetime import datetime

from db.models import db  # shared SQLAlchemy instance
from db.job_models import JobPosition, JobApplication
from db.company_models import Company
from db.candidate_models import CandidateProfile

# ---------------------------------------------------------------------------
# Blueprint definition
# ---------------------------------------------------------------------------

job_bp = Blueprint("jobs", __name__, url_prefix="/api")

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def job_to_dict(job: JobPosition) -> dict:
    """Serialize a JobPosition SQLAlchemy object into a plain dictionary."""
    return {
        "id": job.id,
        "company_id": job.company_id,
        "company_name": job.company.name if job.company else None,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "location": job.location,
        "employment_type": job.employment_type,
        "remote": job.remote,
        "posted_at": job.posted_at.isoformat() if job.posted_at else None,
        "expires_at": job.expires_at.isoformat() if job.expires_at else None,
    }

def application_to_dict(app: JobApplication) -> dict:
    """Serialize a JobApplication object."""
    return {
        "id": app.id,
        "candidate_id": app.candidate_id,
        "candidate_name": app.candidate.full_name if app.candidate else None,
        "job_position_id": app.job_position_id,
        "applied_at": app.applied_at.isoformat() if app.applied_at else None,
        "status": app.status,
    }

# ---------------------------------------------------------------------------
# CRUD routes for JobPosition
# ---------------------------------------------------------------------------

@job_bp.route("/jobs", methods=["POST"])
def create_job():
    """Create a new job posting."""
    data = request.get_json() or {}

    required_fields = ["company_id", "title"]
    for field in required_fields:
        if field not in data:
            abort(400, description=f"'{field}' is required")

    # Validate company exists
    company = Company.query.get(data["company_id"])
    if not company:
        abort(404, description="Company not found")

    job = JobPosition(
        company_id=data["company_id"],
        title=data["title"],
        description=data.get("description"),
        requirements=data.get("requirements"),
        location=data.get("location"),
        employment_type=data.get("employment_type"),
        remote=data.get("remote", False),
        posted_at=datetime.utcnow(),
        expires_at=datetime.fromisoformat(data["expires_at"]) if data.get("expires_at") else None,
    )
    db.session.add(job)
    db.session.commit()

    return jsonify(job_to_dict(job)), 201


@job_bp.route("/jobs", methods=["GET"])
def list_jobs():
    """Return a paginated list of jobs.

    Query params:
        - q:         free‑text search (title/description)
        - location:  filter by location
        - remote:    true/false for remote jobs
        - company:   filter by company_id
        - page:      page number (default 1)
        - per_page:  items per page (default 20, maximum 100)
        - sort:      posted_at|expires_at (default posted_at)
        - order:     asc|desc (default desc)
    """
    q            = request.args.get("q")
    location     = request.args.get("location")
    remote_str   = request.args.get("remote")
    company_id   = request.args.get("company", type=int)
    page         = request.args.get("page", default=1, type=int)
    per_page     = min(request.args.get("per_page", default=20, type=int), 100)
    sort         = request.args.get("sort", default="posted_at")
    order        = request.args.get("order", default="desc")

    query = JobPosition.query

    if q:
        query = query.filter(or_(JobPosition.title.ilike(f"%{q}%"), JobPosition.description.ilike(f"%{q}%")))
    if location:
        query = query.filter(JobPosition.location.ilike(f"%{location}%"))
    if remote_str is not None:
        query = query.filter(JobPosition.remote.is_(remote_str.lower() == "true"))
    if company_id:
        query = query.filter_by(company_id=company_id)

    # Sorting
    sort_attr = getattr(JobPosition, sort, JobPosition.posted_at)
    if order == "desc":
        sort_attr = desc(sort_attr)
    query = query.order_by(sort_attr)

    # Pagination
    page_obj = query.paginate(page=page, per_page=per_page, error_out=False)
    jobs = [job_to_dict(j) for j in page_obj.items]

    return jsonify({
        "items": jobs,
        "page": page_obj.page,
        "total_pages": page_obj.pages,
        "total_items": page_obj.total,
    })


@job_bp.route("/jobs/<int:job_id>", methods=["GET"])
def get_job(job_id: int):
    job = JobPosition.query.get_or_404(job_id)
    return jsonify(job_to_dict(job))


@job_bp.route("/jobs/<int:job_id>", methods=["PUT", "PATCH"])
def update_job(job_id: int):
    job = JobPosition.query.get_or_404(job_id)
    data = request.get_json() or {}

    # Update allowed fields
    for field in ["title", "description", "requirements", "location", "employment_type", "remote", "expires_at"]:
        if field in data:
            if field == "expires_at" and data[field] is not None:
                setattr(job, field, datetime.fromisoformat(data[field]))
            else:
                setattr(job, field, data[field])

    db.session.commit()
    return jsonify(job_to_dict(job))


@job_bp.route("/jobs/<int:job_id>", methods=["DELETE"])
def delete_job(job_id: int):
    """Delete a job posting (hard delete). In production consider soft‑delete."""
    job = JobPosition.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return "", 204


# ---------------------------------------------------------------------------
# Auxiliary / convenience routes
# ---------------------------------------------------------------------------

@job_bp.route("/companies/<int:company_id>/jobs", methods=["GET"])
def list_company_jobs(company_id: int):
    company = Company.query.get_or_404(company_id)
    jobs = [job_to_dict(j) for j in company.job_positions]
    return jsonify(jobs)


@job_bp.route("/jobs/<int:job_id>/applications", methods=["GET"])
def list_job_applications(job_id: int):
    job = JobPosition.query.get_or_404(job_id)
    applications = [application_to_dict(a) for a in job.job_applications]
    return jsonify(applications)


@job_bp.route("/jobs/<int:job_id>/apply", methods=["POST"])
def apply_to_job(job_id: int):
    """Endpoint for candidates to apply to a job."""
    job = JobPosition.query.get_or_404(job_id)
    data = request.get_json() or {}

    required_fields = ["candidate_id"]
    for field in required_fields:
        if field not in data:
            abort(400, description=f"'{field}' is required")

    candidate = CandidateProfile.query.get(data["candidate_id"])
    if not candidate:
        abort(404, description="Candidate not found")

    # Prevent duplicate application
    existing = JobApplication.query.filter_by(candidate_id=candidate.id, job_position_id=job.id).first()
    if existing:
        abort(409, description="Candidate has already applied to this job")

    application = JobApplication(
        candidate_id=candidate.id,
        job_position_id=job.id,
        status="Applied",
        resume_path=data.get("resume_path"),
        cover_letter_path=data.get("cover_letter_path"),
        applied_at=datetime.utcnow(),
    )
    db.session.add(application)
    db.session.commit()

    return jsonify(application_to_dict(application)), 201


# ---------------------------------------------------------------------------
# Blueprint registration helper
# ---------------------------------------------------------------------------

def register_job_routes(app):
    """Call this from your application factory to register the blueprint."""
    app.register_blueprint(job_bp)
