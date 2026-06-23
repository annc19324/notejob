import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'If an account exists, a recovery link has been sent.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send recovery email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="NoteJob Logo" className="auth-logo" />
          <h1 className="auth-title">Khôi phục mật khẩu</h1>
        </div>
        {message && <div style={{ color: 'var(--success)', textAlign: 'center', fontSize: '14px', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px' }}>{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="form-group">
          <div className="form-group">
            <label className="form-label">Địa chỉ Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="form-button" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi Email khôi phục'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Trở về trang Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
