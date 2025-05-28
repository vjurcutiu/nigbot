from flask import Blueprint, request, jsonify, session
from db.models import CandidateProfile, Hire, Conversation, Participant, db
from datetime import datetime

hire_bp = Blueprint('hire', __name__, url_prefix='/api/hire')

@hire_bp.route('/<int:candidate_id>', methods=['POST'])
def hire_candidate(candidate_id):
    try:
        if 'user_id' not in session or session.get('role') != 'client':
            return jsonify({"error": "Unauthorized"}), 401

        data = request.get_json() or {}
        job_position_id = data.get('job_position_id')

        client_id = session.get('user_id')

        # Check if candidate exists
        candidate = CandidateProfile.query.filter_by(id=candidate_id).first()
        if not candidate:
            return jsonify({"error": "Candidate not found"}), 404

        if not candidate.user or not hasattr(candidate.user, 'id'):
            return jsonify({"error": "Candidate user information is incomplete"}), 400

        # Check if already hired
        existing_hire = Hire.query.filter_by(
            client_id=client_id,
            candidate_id=candidate_id,
            status='active'
        ).first()
        if existing_hire:
            return jsonify({"error": "Candidate has already been hired by this client"}), 400

        # Create Hire record
        hire = Hire(
            client_id=client_id,
            candidate_id=candidate_id,
            job_position_id=job_position_id,
            hired_at=datetime.utcnow(),
            status='active'
        )
        db.session.add(hire)
        db.session.flush()

        # Create chat conversation between client and candidate
        conv = Conversation()
        db.session.add(conv)
        db.session.flush()

        db.session.add(Participant(conversation_id=conv.id, user_id=client_id, last_read=datetime.utcnow()))
        # Fix: User object has no attribute 'user_id', use 'id' instead
        db.session.add(Participant(conversation_id=conv.id, user_id=candidate.user.id, last_read=datetime.utcnow()))

        db.session.commit()

        return jsonify({"status": "success", "hire_id": hire.id, "conversation_id": conv.id}), 201
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error: " + str(e)}), 500
