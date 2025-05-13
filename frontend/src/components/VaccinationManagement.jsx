import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VaccinationManagement.css';

export default function VaccinationManagement() {
  const [drives, setDrives] = useState([]);
  const [formData, setFormData] = useState({
    vaccine_name: '',
    date: '',
    available_doses: '',
    applicable_classes: [],
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch the upcoming drives on component mount
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const response = await fetch('http://localhost:5000/drives/upcoming');
        const result = await response.json();
        setDrives(result);
      } catch (error) {
        console.error('Error fetching drives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle checkbox changes for applicable classes
  const handleClassChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const updatedClasses = checked
        ? [...prevData.applicable_classes, value]
        : prevData.applicable_classes.filter((className) => className !== value);

      return {
        ...prevData,
        applicable_classes: updatedClasses,
      };
    });
  };

  // Submit the form to create a new vaccination drive
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { vaccine_name, date, available_doses, applicable_classes } = formData;

    if (!vaccine_name || !date || !available_doses || !applicable_classes.length) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Vaccination drive created successfully.');
        setFormData({
          vaccine_name: '',
          date: '',
          available_doses: '',
          applicable_classes: [],
        });
        // Refresh the drives list after adding the new drive
        setDrives((prevDrives) => [...prevDrives, result]);
      } else {
        setErrorMessage(result.error || 'Error creating vaccination drive.');
      }
    } catch (error) {
      setErrorMessage('Error creating vaccination drive.');
      console.error(error);
    }
  };

  // Handle editing an existing drive
  const handleEditDrive = async (driveId) => {
    const driveToEdit = drives.find((drive) => drive.id === driveId);
    if (driveToEdit && new Date(driveToEdit.date) < new Date()) {
      alert('This drive has already passed and cannot be edited.');
      return;
    }
    // Navigate to the edit page (you can create a separate page for this)
    navigate(`/drives/edit/${driveId}`);
  };

  // Render the form for adding a new drive
  const renderForm = () => (
    <form onSubmit={handleSubmit} className="drive-form">
      <h2>Create New Vaccination Drive</h2>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <div className="form-group">
        <label>Vaccine Name</label>
        <input
          type="text"
          name="vaccine_name"
          value={formData.vaccine_name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Drive Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Available Doses</label>
        <input
          type="number"
          name="available_doses"
          value={formData.available_doses}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Applicable Classes</label>
        <div className="class-checkboxes">
          {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'].map((className) => (
            <label key={className}>
              <input
                type="checkbox"
                value={className}
                checked={formData.applicable_classes.includes(className)}
                onChange={handleClassChange}
              />
              {className}
            </label>
          ))}
        </div>
      </div>
      <button type="submit">Create Drive</button>
    </form>
  );

  // Render the list of upcoming vaccination drives
  const renderUpcomingDrives = () => (
    <div className="upcoming-drives">
      <h2>Upcoming Vaccination Drives</h2>
      {drives.length === 0 ? (
        <p>No upcoming drives scheduled.</p>
      ) : (
        <table className="drive-table">
          <thead>
            <tr>
              <th>Vaccine</th>
              <th>Date</th>
              <th>Available Doses</th>
              <th>Applicable Classes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drives.map((drive) => (
              <tr key={drive.id}>
                <td>{drive.vaccine_name}</td>
                <td>{drive.date}</td>
                <td>{drive.available_doses}</td>
                <td>{drive.applicable_classes.join(', ')}</td>
                <td>
                  <button
                    onClick={() => handleEditDrive(drive.id)}
                    disabled={new Date(drive.date) < new Date()}
                  >
                    {new Date(drive.date) < new Date() ? 'Cannot Edit' : 'Edit'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (loading) {
    return <p>Loading vaccination drives...</p>;
  }

  return (
    <div className="vaccination-management">
      {renderForm()}
      {renderUpcomingDrives()}
    </div>
  );
}
