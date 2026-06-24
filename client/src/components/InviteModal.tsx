import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function InviteModal({ projectId, onClose }: { projectId: string, onClose: () => void }) {
  const [identifier, setIdentifier] = useState('');

  const handleInvite = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/board/project/invite', { projectId, identifier }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã gửi lời mời!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Lỗi khi mời người dùng!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Thêm thành viên vào dự án</h2>
        <div className="form-group">
          <label className="form-label">Tên người dùng hoặc Email</label>
          <input 
            className="form-input" 
            value={identifier} 
            onChange={e => setIdentifier(e.target.value)} 
            placeholder="Ví dụ: nguyenvanA hoặc a@gmail.com"
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="form-button" onClick={handleInvite}>Gửi lời mời</button>
          <button className="form-button" style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={onClose}>Hủy</button>
        </div>
        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Hoặc sao chép link mời: <br/>
          <input className="form-input" value={`${window.location.origin}/invite/${projectId}`} readOnly onFocus={e => e.target.select()} />
        </div>
      </div>
    </div>
  );
}
