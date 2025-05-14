import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/dashboard/overview');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>Error loading dashboard.</p>;

  return (
    <div className="dashboard">
      <div className="metrics">
        <div className="card">
          <h2>Total Students</h2>
          <p>{data.total_students}</p>
        </div>
        <div className="card">
          <h2>Vaccinated Students</h2>
          <p>{data.vaccinated_students}</p>
        </div>
        <div className="card">
          <h2>Vaccination %</h2>
          <p>{data.percentage_vaccinated.toFixed(1)}%</p>
        </div>
      </div>


      <div className="drives">
          <h2>Ongoing Vaccination Drives</h2>
          {data.ongoing_drives.length === 0 ? (
            <p className="empty">No ongoing drives today</p>
          ) : (
            <ul>
              {data.ongoing_drives.map((drive) => (
                <li key={drive.id}>
                  <strong>{drive.vaccine}</strong> on {drive.date}
                </li>
              ))}
            </ul>
          )}

        <h2>Upcoming Vaccination Drives</h2>
        {data.upcoming_drives.length === 0 ? (
          <p className="empty">No upcoming drives</p>
        ) : (
          <ul>
            {data.upcoming_drives.map((drive) => (
              <li key={drive.id}>
                <strong>{drive.vaccine}</strong> on {drive.date}
              </li>
            ))}
          </ul>
        )}


      </div>



      {/*<div className="dashboard-actions">*/}
      {/*  <button onClick={() => navigate('/students')}>Manage Students</button>*/}
      {/*  <button onClick={() => navigate('/manage-drives')}>Manage Vaccinations</button>*/}
      {/*  <button onClick={() => navigate('/reports')}>Generate Report</button>*/}
      {/*</div>*/}
    </div>
  );
}
