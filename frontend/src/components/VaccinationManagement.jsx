import React, { useEffect, useState } from 'react';
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
  const [editMode, setEditMode] = useState(false);
  const [editingDriveId, setEditingDriveId] = useState(null);

  // Fetch upcoming drives
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClassChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const updatedClasses = checked
        ? [...prevData.applicable_classes, value]
        : prevData.applicable_classes.filter((c) => c !== value);
      return { ...prevData, applicable_classes: updatedClasses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const { vaccine_name, date, available_doses, applicable_classes } = formData;

    if (!vaccine_name || !date || !available_doses || !applicable_classes.length) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      const url = editMode
        ? `http://localhost:5000/drives/${editingDriveId}`
        : 'http://localhost:5000/drives';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(editMode ? 'Drive updated successfully.' : 'Drive created successfully.');
        setFormData({
          vaccine_name: '',
          date: '',
          available_doses: '',
          applicable_classes: [],
        });
        setEditMode(false);
        setEditingDriveId(null);

        // Refresh drives list
        const updatedResponse = await fetch('http://localhost:5000/drives/upcoming');
        const updatedDrives = await updatedResponse.json();
        setDrives(updatedDrives);
      } else {
        setErrorMessage(result.error || 'Error saving vaccination drive.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Error saving vaccination drive.');
    }
  };

  const handleEditDrive = (driveId) => {
    const drive = drives.find((d) => d.id === driveId);
    if (!drive) return;

    if (new Date(drive.date) < new Date()) {
      alert('This drive has already passed and cannot be edited.');
      return;
    }

    setFormData({
      vaccine_name: drive.vaccine_name,
      date: drive.date,
      available_doses: drive.available_doses,
      applicable_classes: drive.applicable_classes,
    });
    setEditMode(true);
    setEditingDriveId(driveId);
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="drive-form">
      <h2>{editMode ? 'Edit Vaccination Drive' : 'Create New Vaccination Drive'}</h2>
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

      <button type="submit">{editMode ? 'Update Drive' : 'Create Drive'}</button>

      {editMode && (
        <button
          type="button"
          onClick={() => {
            setEditMode(false);
            setEditingDriveId(null);
            setFormData({
              vaccine_name: '',
              date: '',
              available_doses: '',
              applicable_classes: [],
            });
          }}
          className="cancel-button"
          style={{ marginLeft: '10px' }}
        >
          Cancel Edit
        </button>
      )}
    </form>
  );

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
