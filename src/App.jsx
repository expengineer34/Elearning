// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import DosenDashboard from './pages/DosenDashboard';
import MahasiswaDashboard from './pages/MahasiswaDashboard';
import CourseDetail from './pages/CourseDetail';
import ManageCourse from './pages/ManageCourse'; // <--- PASTIKAN INI DI-IMPORT

const DashboardManager = () => {
  const { userRole } = useAuth();
  if (userRole === 'dosen') return <DosenDashboard />;
  if (userRole === 'mahasiswa') return <MahasiswaDashboard />;
  return <div className="p-10">Loading Dashboard...</div>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 1. Login & Register */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 2. Dashboard Utama (Dosen & Mahasiswa) */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardManager />
              </PrivateRoute>
            } 
          />

          {/* 3. Halaman Detail Materi (Untuk Belajar Mahasiswa) */}
          <Route 
            path="/course/:id" 
            element={
              <PrivateRoute>
                <CourseDetail />
              </PrivateRoute>
            } 
          />

          {/* 4. Halaman Kelola Materi (KHUSUS DOSEN - INI YANG TADI ERROR) */}
          <Route 
            path="/manage-course/:id" 
            element={
              <PrivateRoute>
                <ManageCourse />
              </PrivateRoute>
            } 
          />

          {/* 5. Redirect default */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 6. Handler jika halaman tidak ditemukan */}
          <Route path="*" element={<div className="p-10">404 - Halaman Tidak Ditemukan</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;