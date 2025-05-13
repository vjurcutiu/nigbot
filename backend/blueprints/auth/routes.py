from flask import Blueprint, request, jsonify, session
from db.models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        session['user_id'] = user.id
        session['role'] = user.role
        return jsonify({"message": "Logged in", "role": user.role}), 200
    return jsonify({"error": "Invalid credentials"}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"}), 200

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json or {}
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')  # expect 'client' or 'candidate'

        # basic validation
        if not username or not password or role not in ('client', 'candidate'):
            return jsonify({"error": "Username, password, and valid role are required"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already taken"}), 409

        # create and save
        user = User(username=username, role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        if user.role == 'candidate':
            from db.models import CandidateProfile
            candidate_profile = CandidateProfile(
                user_id=user.id,
                full_name=data.get('full_name', user.username),
                email=data.get('email'),
                phone=data.get('phone'),
                city=data.get('city'),
                country=data.get('country'),
                profile_picture=data.get('profile_picture'),
                summary=data.get('summary'),
            )
            db.session.add(candidate_profile)
            db.session.commit()
        elif user.role == 'client':
            from db.company_models import Company
            company = Company(
                user_id=user.id,
                name=data.get('company_name', f"Company of {user.username}"),
                bio=data.get('company_bio', ''),
                website=data.get('company_website', ''),
                industry=data.get('company_industry', ''),
                size=data.get('company_size', ''),
                address=data.get('company_address', ''),
                city=data.get('company_city', ''),
                country=data.get('company_country', ''),
                contact_email=data.get('company_contact_email', ''),
                contact_phone=data.get('company_contact_phone', ''),
            )
            db.session.add(company)
            db.session.commit()

        return jsonify({"message": "Signup successful", "role": user.role}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
