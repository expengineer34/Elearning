// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // Jika tidak ada user (belum login), redirect ke login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Jika ada, perbolehkan masuk ke halaman yang dituju
  return children;
};

export default PrivateRoute;