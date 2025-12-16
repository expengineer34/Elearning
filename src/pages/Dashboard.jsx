// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Gagal logout", error);
    }
  };

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #ccc',
          paddingBottom: '1rem'
      }}>
        <h1>Dashboard E-Learning</h1>
        <button onClick={handleLogout} className="btn" style={{ backgroundColor: '#ccc' }}>Logout</button>
      </header>
      
      <main style={{ marginTop: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }}>
            <h3>Info Pengguna Saat Ini:</h3>
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <p><strong>Role:</strong> <span style={{ textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 'bold' }}>{userRole}</span></p>
        </div>
        
        <p style={{ marginTop: '1rem' }}>
            {userRole === 'dosen' 
                ? "Halo Pak/Bu Dosen! Silakan kelola materi kuliah." 
                : "Halo Mahasiswa! Silakan lihat materi yang tersedia."}
        </p>
      </main>
    </div>
  );
};

export default Dashboard;