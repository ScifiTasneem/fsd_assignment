from io import StringIO
from flask import Blueprint, request, jsonify
from backend.models import db, Student, VaccinationRecord, VaccinationDrive
import csv
from datetime import datetime

student_bp = Blueprint('students', __name__)

# Add a new student
@student_bp.route('/students', methods=['POST'])
def add_student():
    data = request.json
    new_student = Student(
        name=data['name'],
        student_class=data['student_class'],
        student_id=data['student_id']
    )
    db.session.add(new_student)
    db.session.commit()
    return jsonify({"message": "Student added successfully."}), 201

# Get/search students
@student_bp.route('/students', methods=['GET'])
def get_students():
    name = request.args.get('name')
    student_class = request.args.get('class')
    vaccinated = request.args.get('vaccinated')

    query = Student.query

    if name:
        query = query.filter(Student.name.ilike(f'%{name}%'))
    if student_class:
        query = query.filter_by(student_class=student_class)
    if vaccinated == 'true':
        query = query.join(VaccinationRecord).distinct()
    elif vaccinated == 'false':
        query = query.outerjoin(VaccinationRecord).filter(VaccinationRecord.id.is_(None))

    students = query.all()
    result = []
    for s in students:
        result.append({
            'id': s.id,
            'name': s.name,
            'class': s.student_class,
            'vaccinated': len(s.vaccination_records) > 0
        })
    return jsonify(result)

# Bulk upload via CSV
@student_bp.route('/students/upload', methods=['POST'])
def upload_students_csv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    stream = StringIO(file.stream.read().decode("UTF-8"), newline=None)
    reader = csv.DictReader(stream)

    for row in reader:
        try:
            dob = datetime.strptime(row['dob'], '%Y-%m-%d').date() if row['dob'] else None
            student = Student(
                name=row['name'],
                student_id=row['student_id'],
                student_class=row['student_class'],
                dob=dob,
                gender=row.get('gender'),
                guardian_name=row.get('guardian_name'),
                contact_number=row.get('contact_number'),
                address=row.get('address'),
            )
            db.session.add(student)
        except Exception as e:
            return jsonify({'error': f"Error in row: {row}. {str(e)}"}), 400

    db.session.commit()
    return jsonify({'message': 'Students uploaded successfully'})


# Vaccinate student in a drive
@student_bp.route('/students/<int:student_id>/vaccinate', methods=['POST'])
def vaccinate_student(student_id):
    data = request.json
    drive_id = data['drive_id']
    drive = VaccinationDrive.query.get(drive_id)

    # Validation
    if not drive:
        return jsonify({"error": "Drive not found."}), 404
    existing = VaccinationRecord.query.filter_by(student_id=student_id, drive_id=drive_id).first()
    if existing:
        return jsonify({"error": "Student already vaccinated for this drive."}), 400

    # Create vaccination record
    record = VaccinationRecord(student_id=student_id, drive_id=drive_id)
    db.session.add(record)
    db.session.commit()
    return jsonify({"message": "Student vaccinated successfully."}), 200


@student_bp.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        # Find the student by ID
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        # Delete the student record from the database
        db.session.delete(student)
        db.session.commit()

        return jsonify({"message": "Student deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500