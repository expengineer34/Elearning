// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Gagal login: Email atau password salah');
      console.error(err);
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
          Masuk E-Learning
        </h2>
        
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
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
          
          <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          Belum punya akun? <Link to="/register" style={{ color: 'var(--primary-color)' }}>Daftar disini</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;