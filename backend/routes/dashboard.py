from flask import Blueprint, jsonify
from backend.models import db, Student, VaccinationDrive, VaccinationRecord
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/overview', methods=['GET'])
def get_dashboard_metrics():
    total_students = Student.query.count()
    vaccinated_students = db.session.query(VaccinationRecord.student_id).distinct().count()
    percentage = (vaccinated_students / total_students * 100) if total_students else 0

    upcoming = VaccinationDrive.query.filter(
        VaccinationDrive.date >= datetime.today(),
        VaccinationDrive.date <= datetime.today() + timedelta(days=30)
    ).all()

    return jsonify({
        "total_students": total_students,
        "vaccinated_students": vaccinated_students,
        "percentage_vaccinated": percentage,
        "upcoming_drives": [{"id": d.id, "vaccine": d.vaccine_name, "date": d.date.strftime('%Y-%m-%d')} for d in upcoming]
    })
