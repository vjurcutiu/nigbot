from flask import Blueprint, request, jsonify
from db.models import db
from db.company_models import Company, JobPosition
from db.candidate_models import CandidateProfile, EmploymentHistory, LegalDocument, JobApplication, CandidateSkill, Education, Skill
from db.user_models import User
from datetime import date

addon_bp = Blueprint('addon', __name__, url_prefix='/extra')

@addon_bp.route('/add_items', methods=['POST'])
def add_items():
    """
    Endpoint to add multiple clients and candidates in batch.
    Expects JSON payload with 'clients' and 'candidates' arrays.
    """
    data = request.get_json() or {}
    clients = data.get('clients', [])
    candidates = data.get('candidates', [])
    created = {'clients': [], 'candidates': []}

    # Add clients and their companies
    for c in clients:
        username = c.get('username')
        password = c.get('password')
        comp_info = c.get('company', {})
        if not username or not password or not comp_info.get('name'):
            continue
        user = User(username=username, role='client')
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # assign user.id

        # Parse founded_date string into date object
        founded_date = None
        fd = comp_info.get('founded_date')
        if fd:
            try:
                founded_date = date.fromisoformat(fd)
            except ValueError:
                founded_date = None

        company = Company(
            user_id=user.id,
            name=comp_info.get('name'),
            bio=comp_info.get('bio'),
            profile_picture=comp_info.get('profile_picture'),
            website=comp_info.get('website'),
            industry=comp_info.get('industry'),
            size=comp_info.get('size'),
            founded_date=founded_date,
            address=comp_info.get('address'),
            city=comp_info.get('city'),
            country=comp_info.get('country'),
            latitude=comp_info.get('latitude'),
            longitude=comp_info.get('longitude'),
            contact_email=comp_info.get('contact_email'),
            contact_phone=comp_info.get('contact_phone')
        )
        db.session.add(company)
        created['clients'].append({'user_id': user.id, 'company_id': None})

    # Add candidates and their profiles
    for c in candidates:
        username = c.get('username')
        password = c.get('password')
        prof_info = c.get('profile', {})
        if not username or not password or not prof_info.get('full_name') or not prof_info.get('email'):
            continue
        user = User(username=username, role='candidate')
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        profile = CandidateProfile(
            user_id=user.id,
            full_name=prof_info.get('full_name'),
            email=prof_info.get('email'),
            phone=prof_info.get('phone'),
            city=prof_info.get('city'),
            country=prof_info.get('country'),
            profile_picture=prof_info.get('profile_picture'),
            summary=prof_info.get('summary')
        )
        db.session.add(profile)
        created['candidates'].append({'user_id': user.id, 'profile_id': None})

    # Commit transaction
    try:
        db.session.commit()
        # Populate returned IDs
        for idx in range(len(created['clients'])):
            uid = created['clients'][idx]['user_id']
            created['clients'][idx]['company_id'] = Company.query.filter_by(user_id=uid).first().id
        for idx in range(len(created['candidates'])):
            uid = created['candidates'][idx]['user_id']
            created['candidates'][idx]['profile_id'] = CandidateProfile.query.filter_by(user_id=uid).first().id
        return jsonify({'status': 'success', 'created': created}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400