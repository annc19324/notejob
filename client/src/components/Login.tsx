import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/login', {
        email, password, rememberMe
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="NoteJob Logo" className="auth-logo" />
          <h1 className="auth-title">Welcome Back</h1>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin} className="form-group">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
            />
            <label htmlFor="remember">Duy trì đăng nhập</label>
          </div>
          <button type="submit" className="form-button">Log in</button>
        </form>
        <div className="auth-links">
          <Link to="/register">Don't have an account? Sign up</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
