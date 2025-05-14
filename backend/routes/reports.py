from flask import Blueprint, request, jsonify, send_file
from backend.models import db, Student, VaccinationRecord, VaccinationDrive
from sqlalchemy.orm import joinedload
import csv
from io import StringIO

report_bp = Blueprint('report', __name__)

@report_bp.route('/reports', methods=['GET'])
def get_vaccination_report():
    vaccine_name = request.args.get('vaccine_name')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('limit', 10))

    query = VaccinationRecord.query.join(VaccinationDrive).join(Student).options(
        joinedload(VaccinationRecord.student),
        joinedload(VaccinationRecord.drive)
    )

    if vaccine_name:
        query = query.filter(VaccinationDrive.vaccine_name.ilike(f"%{vaccine_name}%"))

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)

    data = []
    for record in paginated.items:
        data.append({
            "student_name": record.student.name,
            "class": record.student.student_class,
            "vaccine_name": record.drive.vaccine_name,
            "date_vaccinated": record.date_vaccinated.strftime('%Y-%m-%d')
        })

    return jsonify({
        "records": data,
        "page": page,
        "total_pages": paginated.pages,
        "total_items": paginated.total
    })

@report_bp.route('/reports/export', methods=['GET'])
def export_report_csv():
    vaccine_name = request.args.get('vaccine_name')

    query = VaccinationRecord.query.join(VaccinationDrive).join(Student).options(
        joinedload(VaccinationRecord.student),
        joinedload(VaccinationRecord.drive)
    )

    if vaccine_name:
        query = query.filter(VaccinationDrive.vaccine_name.ilike(f"%{vaccine_name}%"))

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(['Student Name', 'Class', 'Vaccine Name', 'Date Vaccinated'])

    for record in query.all():
        writer.writerow([
            record.student.name,
            record.student.student_class,
            record.drive.vaccine_name,
            record.date_vaccinated.strftime('%Y-%m-%d')
        ])

    output.seek(0)
    return send_file(
        output,
        mimetype='text/csv',
        as_attachment=True,
        download_name='vaccination_report.csv'
    )


@report_bp.route('/vaccines', methods=['GET'])
def get_vaccine_names():
    # Query to get distinct vaccine names
    vaccines = db.session.query(VaccinationDrive.vaccine_name).distinct().all()
    vaccine_names = [v[0] for v in vaccines]
    print(vaccine_names)

    return jsonify(vaccine_names)
