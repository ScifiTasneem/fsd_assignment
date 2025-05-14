from flask import Blueprint, request, jsonify
from backend.models import db, VaccinationDrive
from datetime import datetime, timedelta

drive_bp = Blueprint('drives', __name__)

# Create new drive
@drive_bp.route('/drives', methods=['POST'])
def create_drive():
    data = request.json
    date = datetime.strptime(data['date'], '%Y-%m-%d')
    today_plus_15 = datetime.today() + timedelta(days=15)

    if date < today_plus_15:
        return jsonify({"error": "Drives must be scheduled at least 15 days in advance."}), 400

    overlaps = VaccinationDrive.query.filter_by(date=date).first()
    if overlaps:
        return jsonify({"error": "Another drive is already scheduled on this date."}), 400

    new_drive = VaccinationDrive(
        vaccine_name=data['vaccine_name'],
        date=date,
        available_doses=data['available_doses'],
        applicable_classes=','.join(data['applicable_classes'])
    )
    db.session.add(new_drive)
    db.session.commit()
    return jsonify({"message": "Drive created."}), 201

# Get upcoming drives
@drive_bp.route('/drives/upcoming', methods=['GET'])
def get_upcoming_drives():
    today = datetime.today()
    drives = VaccinationDrive.query.filter(VaccinationDrive.date >= today).all()
    return jsonify([{
        'id': d.id,
        'vaccine_name': d.vaccine_name,
        'date': d.date.strftime('%Y-%m-%d'),
        'available_doses': d.available_doses,
        'applicable_classes': d.applicable_classes.split(',')
    } for d in drives])

# Edit drive
@drive_bp.route('/drives/<int:drive_id>', methods=['PUT'])
def edit_drive(drive_id):
    data = request.json
    drive = VaccinationDrive.query.get(drive_id)

    if not drive:
        return jsonify({"error": "Drive not found."}), 404
    if drive.date < datetime.today().date():
        return jsonify({"error": "Past drives cannot be edited."}), 403

    drive.date = datetime.strptime(data['date'], '%Y-%m-%d')
    drive.available_doses = data['available_doses']
    drive.applicable_classes = ','.join(data['applicable_classes'])

    db.session.commit()
    return jsonify({"message": "Drive updated successfully."}), 200

