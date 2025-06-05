# blueprints/candidate/routes.py
from flask import Blueprint, request, jsonify, session
from sqlalchemy.orm import joinedload
from utils.security import sanitize_html
from db.models import (
    CandidateProfile,
    EmploymentHistory,
    LegalDocument,
    JobApplication,
    CandidateSkill,
    Skill,
    Education,
    Hire,
    Conversation,
    Participant,
    db,
)
from datetime import datetime

candidate_bp = Blueprint('candidate', __name__)

from blueprints.auth.routes import login_required

def candidate_required(func):
    """Decorator to ensure the user is authenticated as a candidate."""
    def wrapper(*args, **kwargs):
        if 'user_id' not in session or session.get('role') != 'candidate':
            import logging
            logging.error(f"Unauthorized access attempt in candidate_required decorator. Session data: {dict(session)}")
            return jsonify({"error": "Unauthorized"}), 401
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

@candidate_bp.route('/<int:candidate_id>/full/public', methods=['GET'])
@login_required
def get_candidate_full_public(candidate_id):
    """
    Public endpoint to retrieve a candidate and all related info by candidate ID.
    Accessible to any authenticated user.
    """
    candidate = CandidateProfile.query.options(
        joinedload(CandidateProfile.employments),
        joinedload(CandidateProfile.documents),
        joinedload(CandidateProfile.applications),
        joinedload(CandidateProfile.candidate_skills).joinedload(CandidateSkill.skill),
        joinedload(CandidateProfile.educations),
    ).filter_by(id=candidate_id).first()

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    profile = {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "full_name": candidate.full_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "city": candidate.city,
        "country": candidate.country,
        "profile_picture": candidate.profile_picture,
        "summary": candidate.summary,
    }

    employments = [
        {
            "id": emp.id,
            "company_name": emp.company_name,
            "position": emp.position,
            "start_date": emp.start_date.isoformat(),
            "end_date": emp.end_date.isoformat() if emp.end_date else None,
            "description": emp.description,
        }
        for emp in candidate.employments
    ]

    documents = [
        {
            "id": doc.id,
            "doc_type": doc.doc_type,
            "file_path": doc.file_path,
            "uploaded_at": doc.uploaded_at.isoformat(),
        }
        for doc in candidate.documents
    ]

    applications = [
        {
            "id": app.id,
            "job_title": app.job_position.title if app.job_position else None,
            "company_name": app.job_position.company.name if app.job_position and app.job_position.company else None,
            "applied_at": app.applied_at.isoformat(),
            "status": app.status,
            "resume_path": app.resume_path,
            "cover_letter_path": app.cover_letter_path,
        }
        for app in candidate.applications
    ]

    skills = [
        {
            "skill_id": cs.skill.id,
            "name": cs.skill.name,
            "proficiency": cs.proficiency,
        }
        for cs in candidate.candidate_skills
    ]

    educations = [
        {
            "id": edu.id,
            "institution": edu.institution,
            "degree": edu.degree,
            "field_of_study": edu.field_of_study,
            "start_date": edu.start_date.isoformat() if edu.start_date else None,
            "end_date": edu.end_date.isoformat() if edu.end_date else None,
            "description": edu.description,
        }
        for edu in candidate.educations
    ]

    return jsonify({
        "profile": profile,
        "employments": employments,
        "documents": documents,
        "applications": applications,
        "skills": skills,
        "educations": educations,
    })

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
    user_id = session.get('user_id')
    candidate = CandidateProfile.query.filter_by(user_id=user_id).first()
    if not candidate:
        return jsonify({"error": "Candidate profile not found"}), 404

    profile = {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "full_name": candidate.full_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "city": candidate.city,
        "country": candidate.country,
        "profile_picture": candidate.profile_picture,
        "summary": candidate.summary,
    }
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

@candidate_bp.route('/<int:candidate_id>/full', methods=['GET'])
@candidate_required
def get_candidate_full(candidate_id):
    """
    Retrieve a candidate and all related info by candidate ID.
    """
    # Eager‑load all relationships
    candidate = CandidateProfile.query.options(
        joinedload(CandidateProfile.employments),
        joinedload(CandidateProfile.documents),
        joinedload(CandidateProfile.applications),
        joinedload(CandidateProfile.candidate_skills).joinedload(CandidateSkill.skill),
        joinedload(CandidateProfile.educations),
    ).filter_by(id=candidate_id).first()

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    # Serialize
    profile = {
        "id": candidate.id,
        "user_id": candidate.user_id,
        "full_name": candidate.full_name,
        "email": candidate.email,
        "phone": candidate.phone,
        "city": candidate.city,
        "country": candidate.country,
        "profile_picture": candidate.profile_picture,
        "summary": candidate.summary,
    }

    employments = [
        {
            "id": emp.id,
            "company_name": emp.company_name,
            "position": emp.position,
            "start_date": emp.start_date.isoformat(),
            "end_date": emp.end_date.isoformat() if emp.end_date else None,
            "description": emp.description,
        }
        for emp in candidate.employments
    ]

    documents = [
        {
            "id": doc.id,
            "doc_type": doc.doc_type,
            "file_path": doc.file_path,
            "uploaded_at": doc.uploaded_at.isoformat(),
        }
        for doc in candidate.documents
    ]

    applications = [
        {
            "id": app.id,
            "job_title": app.job_position.title if app.job_position else None,
            "company_name": app.job_position.company.name if app.job_position and app.job_position.company else None,
            "applied_at": app.applied_at.isoformat(),
            "status": app.status,
            "resume_path": app.resume_path,
            "cover_letter_path": app.cover_letter_path,
        }
        for app in candidate.applications
    ]

    skills = [
        {
            "skill_id": cs.skill.id,
            "name": cs.skill.name,
            "proficiency": cs.proficiency,
        }
        for cs in candidate.candidate_skills
    ]

    educations = [
        {
            "id": edu.id,
            "institution": edu.institution,
            "degree": edu.degree,
            "field_of_study": edu.field_of_study,
            "start_date": edu.start_date.isoformat() if edu.start_date else None,
            "end_date": edu.end_date.isoformat() if edu.end_date else None,
            "description": edu.description,
        }
        for edu in candidate.educations
    ]

    return jsonify({
        "profile": profile,
        "employments": employments,
        "documents": documents,
        "applications": applications,
        "skills": skills,
        "educations": educations,
    })

@candidate_bp.route('/<int:candidate_id>/full', methods=['PATCH'])
@candidate_required
def update_candidate_full(candidate_id):
    """
    Partially update a candidate and any of its related sections.
    Expects JSON payload like:
    {
      "profile": { ... },          # only fields you want to change
      "employments": [ {...}, ... ],  # sync logic as before
      "documents": [ {...}, ... ],
      "applications": [ {...}, ... ],
      "skills": [ { "skill_id": X, "proficiency": "..." }, ... ],
      "educations": [ {...}, ... ]
    }
    """
    data = request.get_json() or {}
    candidate = CandidateProfile.query.options(
        joinedload(CandidateProfile.employments),
        joinedload(CandidateProfile.documents),
        joinedload(CandidateProfile.applications),
        joinedload(CandidateProfile.candidate_skills),
        joinedload(CandidateProfile.educations),
    ).filter_by(id=candidate_id).first()

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    # 1) Top‑level profile updates
    for field in ("full_name", "email", "phone", "city", "country", "profile_picture", "summary"):
        if field in data.get("profile", {}):
            value = data["profile"][field]
            if field == "summary":
                value = sanitize_html(value)
            setattr(candidate, field, value)

    # 2) Helper to sync collections (same as your PUT version)
    def sync_collection(existing_objs, incoming_list, model, unique_key):
        existing_index = {getattr(obj, unique_key): obj for obj in existing_objs if getattr(obj, unique_key) is not None}
        incoming_ids = set()
        for item in incoming_list:
            item_id = item.get(unique_key)
            if item_id and item_id in existing_index:
                obj = existing_index[item_id]
                for k, v in item.items():
                    if hasattr(obj, k):
                        setattr(obj, k, v)
            else:
                new_obj = model(**{k: v for k, v in item.items() if hasattr(model, k)})
                existing_objs.append(new_obj)
            if item_id:
                incoming_ids.add(item_id)
        for obj in list(existing_objs):
            if getattr(obj, unique_key) not in incoming_ids:
                existing_objs.remove(obj)

    # 3) Sync each related list only if provided
    if "employments" in data:
        sync_collection(candidate.employments, data["employments"], EmploymentHistory, "id")
    if "documents" in data:
        sync_collection(candidate.documents, data["documents"], LegalDocument, "id")
    if "applications" in data:
        sync_collection(candidate.applications, data["applications"], JobApplication, "id")

    if "skills" in data:
        existing_skills = {cs.skill_id: cs for cs in candidate.candidate_skills}
        incoming_skill_ids = set()
        for item in data["skills"]:
            sid = item["skill_id"]
            incoming_skill_ids.add(sid)
            if sid in existing_skills:
                existing_skills[sid].proficiency = item.get("proficiency")
            else:
                skill = Skill.query.get(sid)
                if skill:
                    candidate.candidate_skills.append(
                        CandidateSkill(skill_id=sid, proficiency=item.get("proficiency"))
                    )
        for sid, cs in list(existing_skills.items()):
            if sid not in incoming_skill_ids:
                candidate.candidate_skills.remove(cs)

    if "educations" in data:
        sync_collection(candidate.educations, data["educations"], Education, "id")

    db.session.commit()
    return jsonify({"status": "success"}), 200
