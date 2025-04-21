# blueprints/client/routes.py
from flask import Blueprint, request, jsonify, session

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