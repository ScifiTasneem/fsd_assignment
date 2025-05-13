from flask import Blueprint, jsonify, request

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if data.get('username') == 'admin' and data.get('password') == 'admin123':
        return jsonify({"token": "fake-jwt-token", "role": "admin"}), 200
    return jsonify({"message": "Invalid credentials"}), 401
