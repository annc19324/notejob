import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SettingsModal({ user, onClose, onUpdate }: { user: any, onClose: () => void, onUpdate: (user: any) => void }) {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/user/profile', { fullName, username }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã cập nhật thông tin!');
      onUpdate(res.data.user);
      onClose();
    } catch (err) {
      toast.error('Lỗi khi cập nhật!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Cài đặt tài khoản</h2>
        <div className="form-group">
          <label className="form-label">Họ và tên</label>
          <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tên người dùng</label>
          <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="form-button" onClick={handleSave}>Lưu thay đổi</button>
          <button className="form-button" style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
