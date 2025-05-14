import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './VaccinationReport.css';


export default function VaccinationReport() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [vaccineName, setVaccineName] = useState('');
  const [vaccines, setVaccines] = useState([]); // Store available vaccines
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Fetch data from the API
  const fetchReportData = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/reports?vaccine_name=${vaccineName}&page=${page}&limit=${recordsPerPage}`
      );
      const result = await response.json();
      setStudents(result.records);
      setTotalPages(result.total_pages);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available vaccines when the component mounts
  const fetchVaccineNames = async () => {
    try {
      const response = await fetch('http://localhost:5000/vaccines');
      const vaccineNames = await response.json();
      setVaccines(vaccineNames);
    } catch (error) {
      console.error('Error fetching vaccine names:', error);
    }
  };

  // Fetch data on component mount and when filters/page change
  useEffect(() => {
    fetchVaccineNames();
    fetchReportData(page);
  }, [vaccineName, page]);

  // Handle filter change
  const handleFilterChange = (e) => {
    setVaccineName(e.target.value);
    setPage(1); // Reset to the first page when filter changes
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return; // Prevent out-of-bounds page numbers
    setPage(newPage);
  };

  // Handle Excel export
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vaccination Report');
    XLSX.writeFile(workbook, 'vaccination_report.xlsx');
  };

  // Handle PDF export
const handleExportPDF = () => {
  const doc = new jsPDF();

  doc.autoTable({
    head: [['Student Name', 'Class', 'Vaccine Name', 'Date Vaccinated']],
    body: students.map((student) => [
      student.student_name,
      student.class,
      student.vaccine_name,
      student.date_vaccinated,
    ]),
  });

  doc.save('vaccination_report.pdf');
};



  if (loading) {
    return <p>Loading vaccination report...</p>;
  }

  return (
    <div className="vaccination-report">
      <h2>Vaccination Report</h2>

      {/* Filters Section */}
      <div className="filters">
        <label>
          Vaccine Name:
          <select value={vaccineName} onChange={handleFilterChange}>
            <option value="">All Vaccines</option>
            {vaccines.map((vaccine, index) => (
              <option key={index} value={vaccine}>
                {vaccine}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Report Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Vaccine Name</th>
              <th>Date Vaccinated</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="4">No records found.</td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={index}>
                  <td>{student.student_name}</td>
                  <td>{student.class}</td>
                  <td>{student.vaccine_name}</td>
                  <td>{student.date_vaccinated}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>

      {/* Export Buttons */}
      <div className="export-buttons">
        <button onClick={handleExportExcel}>Download as Excel</button>
        <CSVLink data={students} filename="vaccination_report.csv">
          <button>Download as CSV</button>
        </CSVLink>
        <button onClick={handleExportPDF}>Download as PDF</button>
      </div>
    </div>
  );
}
