// App.jsx
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import StudentManagement from './components/StudentManagement';
import VaccinationReport from './components/VaccinationReport';
import VaccinationManagement from './components/VaccinationManagement';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const navigate = useNavigate();

  const handleLogin = (token, role) => {
    localStorage.setItem('token', token);
    setToken(token);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  return (
    <>
      {token && <Navbar onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        {token ? (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<StudentManagement />} />
            <Route path="/report" element={<VaccinationReport />} />
            <Route path="/manage-drives" element={<VaccinationManagement />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </>
  );
}
