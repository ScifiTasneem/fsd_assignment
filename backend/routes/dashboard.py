from flask import Blueprint, jsonify
from backend.models import db, Student, VaccinationDrive, VaccinationRecord
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard/overview', methods=['GET'])
def dashboard_overview():
    total_students = Student.query.count()
    vaccinated_students = VaccinationRecord.query.distinct(VaccinationRecord.student_id).count()
    percentage_vaccinated = (vaccinated_students / total_students * 100) if total_students > 0 else 0

    today = datetime.today().date()

    upcoming = VaccinationDrive.query.filter(VaccinationDrive.date > today).all()
    ongoing = VaccinationDrive.query.filter(VaccinationDrive.date == today).all()

    return jsonify({
        "total_students": total_students,
        "vaccinated_students": vaccinated_students,
        "percentage_vaccinated": percentage_vaccinated,
        "upcoming_drives": [
            {
                "id": d.id,
                "vaccine": d.vaccine_name,
                "date": d.date.strftime('%Y-%m-%d')
            } for d in upcoming
        ],
        "ongoing_drives": [
            {
                "id": d.id,
                "vaccine": d.vaccine_name,
                "date": d.date.strftime('%Y-%m-%d')
            } for d in ongoing
        ]
    })



