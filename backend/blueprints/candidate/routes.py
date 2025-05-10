# blueprints/candidate/routes.py
from flask import Blueprint, request, jsonify, session
from sqlalchemy.orm import joinedload
from backend.db.models import (
    CandidateProfile,
    EmploymentHistory,
    LegalDocument,
    JobApplication,
    CandidateSkill,
    Skill,
    Education,
)
from backend.db import db


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
            "job_title": app.job_title,
            "company_name": app.company_name,
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

@candidate_bp.route('/<int:candidate_id>/full', methods=['PUT'])
@candidate_required
def update_candidate_full(candidate_id):
    """
    Update a candidate and all related info by candidate ID.
    Expects JSON payload:
    {
      "profile": { ... },
      "employments": [ {...}, ... ],
      "documents": [ {...}, ... ],
      "applications": [ {...}, ... ],
      "skills": [ { "skill_id": X, "proficiency": "..." }, ... ],
      "educations": [ {...}, ... ]
    }
    """
    data = request.get_json()
    candidate = CandidateProfile.query.options(
        joinedload(CandidateProfile.employments),
        joinedload(CandidateProfile.documents),
        joinedload(CandidateProfile.applications),
        joinedload(CandidateProfile.candidate_skills),
        joinedload(CandidateProfile.educations),
    ).filter_by(id=candidate_id).first()

    if not candidate:
        return jsonify({"error": "Candidate not found"}), 404

    # --- 1) Update top‑level profile ---
    for field in ("full_name", "email", "phone", "city", "country", "profile_picture", "summary"):
        if field in data.get("profile", {}):
            setattr(candidate, field, data["profile"][field])

    # Helper to sync collections:
    def sync_collection(existing_objs, incoming_list, model, unique_key):
        """
        existing_objs: list of ORM instances (e.g. candidate.employments)
        incoming_list: list of dicts from request
        model: ORM class (e.g. EmploymentHistory)
        unique_key: field name to match on (e.g. 'id')
        """
        # Index existing by key
        existing_index = {getattr(obj, unique_key): obj for obj in existing_objs if getattr(obj, unique_key) is not None}
        incoming_ids = set()
        for item in incoming_list:
            item_id = item.get(unique_key)
            if item_id and item_id in existing_index:
                # update existing
                obj = existing_index[item_id]
                for k, v in item.items():
                    if hasattr(obj, k):
                        setattr(obj, k, v)
            else:
                # new object
                new_obj = model(**{k: v for k, v in item.items() if hasattr(model, k)})
                existing_objs.append(new_obj)
            if item_id:
                incoming_ids.add(item_id)

        # delete removed
        for obj in list(existing_objs):
            if getattr(obj, unique_key) not in incoming_ids:
                existing_objs.remove(obj)

    # --- 2) Sync employments ---
    sync_collection(
        existing_objs=candidate.employments,
        incoming_list=data.get("employments", []),
        model=EmploymentHistory,
        unique_key="id"
    )

    # --- 3) Sync documents ---
    sync_collection(
        existing_objs=candidate.documents,
        incoming_list=data.get("documents", []),
        model=LegalDocument,
        unique_key="id"
    )

    # --- 4) Sync applications ---
    sync_collection(
        existing_objs=candidate.applications,
        incoming_list=data.get("applications", []),
        model=JobApplication,
        unique_key="id"
    )

    # --- 5) Sync skills ---
    # Here we assume skills sent as {"skill_id": 5, "proficiency": "..."}
    existing_skills = {cs.skill_id: cs for cs in candidate.candidate_skills}
    incoming_skill_ids = set()
    for item in data.get("skills", []):
        sid = item["skill_id"]
        incoming_skill_ids.add(sid)
        if sid in existing_skills:
            existing_skills[sid].proficiency = item.get("proficiency")
        else:
            # ensure skill exists
            skill = Skill.query.get(sid)
            if skill:
                candidate.candidate_skills.append(
                    CandidateSkill(skill_id=sid, proficiency=item.get("proficiency"))
                )
    # remove deselected
    for sid, cs in list(existing_skills.items()):
        if sid not in incoming_skill_ids:
            candidate.candidate_skills.remove(cs)

    # --- 6) Sync educations ---
    sync_collection(
        existing_objs=candidate.educations,
        incoming_list=data.get("educations", []),
        model=Education,
        unique_key="id"
    )

    # Commit all changes
    db.session.commit()

    return jsonify({"status": "success"}), 200