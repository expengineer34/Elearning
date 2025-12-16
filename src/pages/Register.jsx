// src/pages/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('mahasiswa'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi sederhana
    if(password.length < 6) {
        return setError('Password minimal 6 karakter');
    }

    try {
      setError('');
      setLoading(true);
      await register(email, password, name, role);
      navigate('/dashboard'); // Redirect jika sukses
    } catch (err) {
      setError('Gagal mendaftar: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="page-center">
      <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: 'var(--radius)', 
          boxShadow: 'var(--shadow)',
          width: '100%', 
          maxWidth: '400px' 
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>
          Daftar Akun Baru
        </h2>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input 
                type="text" 
                className="form-input" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
                type="email" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
            />
          </div>

          <div className="form-group">
            <label>Daftar Sebagai</label>
            <select 
                className="form-input" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
            </select>
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {loading ? 'Loading...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login disini</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;