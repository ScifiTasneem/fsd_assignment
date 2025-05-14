import React, { useState, useEffect } from 'react';
import './StudentManagement.css';

function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({ name: '', studentClass: '', vaccinated: '' });
  const [newStudent, setNewStudent] = useState({ name: '', student_class: '', student_id: '' });
  const [csvFile, setCsvFile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [editStudent, setEditStudent] = useState(null);

  const fetchStudents = async () => {
    const query = new URLSearchParams({
      name: filters.name,
      studentClass: filters.studentClass,
      vaccinated: filters.vaccinated,
      drive_id: selectedDrive
    }).toString();

    const res = await fetch(`http://localhost:5000/students?${query}`);
    const data = await res.json();
    setStudents(data);
  };

  const fetchDrives = async () => {
    const res = await fetch('http://localhost:5000/dashboard/overview');
    const data = await res.json();
    setDrives(data.upcoming_drives || []);
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters, selectedDrive]);

  const handleAddStudent = async () => {
    const res = await fetch('http://localhost:5000/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent)
    });
    if (res.ok) {
      setNewStudent({ name: '', student_class: '', student_id: '' });
      fetchStudents();
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append('file', csvFile);
    const res = await fetch('http://localhost:5000/students/upload', {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      setCsvFile(null);
      fetchStudents();
    }
  };

  const handleVaccinate = async (studentId) => {
    if (!selectedDrive) return;
    const res = await fetch(`http://localhost:5000/students/${studentId}/vaccinate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drive_id: selectedDrive })
    });
    if (res.ok) fetchStudents();
  };

  const handleEditStudent = async () => {
    if (!editStudent) return;
    const res = await fetch(`http://localhost:5000/students/${editStudent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editStudent)
    });
    if (res.ok) {
      setEditStudent(null);
      fetchStudents();
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const res = await fetch(`http://localhost:5000/students/${studentId}`, {
      method: 'DELETE'
    });
    if (res.ok) fetchStudents();
  };

  return (
    <div className="student-management-container">
      <h2>Student Management</h2>

      <div className="filters">
        <input
          placeholder="Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Class"
          value={filters.studentClass}
          onChange={(e) => setFilters({ ...filters, studentClass: e.target.value })}
        />
        <select
          value={filters.vaccinated}
          onChange={(e) => setFilters({ ...filters, vaccinated: e.target.value })}
        >
          <option value="">All</option>
          <option value="true">Vaccinated</option>
          <option value="false">Not Vaccinated</option>
        </select>
        <button onClick={fetchStudents}>Search</button>
      </div>

      <div className="add-student-form">
        <input
          placeholder="Name"
          value={newStudent.name}
          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
        />
        <input
          placeholder="Class"
          value={newStudent.student_class}
          onChange={(e) => setNewStudent({ ...newStudent, student_class: e.target.value })}
        />
        <input
          placeholder="Student ID"
          value={newStudent.student_id}
          onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
        />
        <button onClick={handleAddStudent}>Add Student</button>
      </div>

      <div className="csv-upload">
        <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
        <button onClick={handleCsvUpload}>Upload CSV</button>
      </div>

      <div className="drive-select">
        <select value={selectedDrive} onChange={(e) => setSelectedDrive(e.target.value)}>
          <option value="">Select Drive</option>
          {drives.map((drive) => (
            <option key={drive.id} value={drive.id}>
              {drive.vaccine} - {drive.date}
            </option>
          ))}
        </select>
      </div>

      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Student ID</th>
            <th>Vaccinated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.class}</td>
              <td>{s.student_id}</td>
              <td>{s.vaccinated ? 'Yes' : 'No'}</td>
              <td>
                {!s.vaccinated && selectedDrive && (
                  <button onClick={() => handleVaccinate(s.id)}>Mark Vaccinated</button>
                )}
                <button onClick={() => setEditStudent(s)}>Edit</button>
                <button onClick={() => handleDeleteStudent(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editStudent && (
        <div className="edit-modal">
          <h3>Edit Student</h3>
          <input
            value={editStudent.name}
            onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
          />
          <input
            value={editStudent.student_class}
            onChange={(e) => setEditStudent({ ...editStudent, student_class: e.target.value })}
          />
          <input
            value={editStudent.student_id}
            onChange={(e) => setEditStudent({ ...editStudent, student_id: e.target.value })}
          />
          <button onClick={handleEditStudent}>Save Changes</button>
          <button onClick={() => setEditStudent(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;
