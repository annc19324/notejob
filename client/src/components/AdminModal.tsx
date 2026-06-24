import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, Shield, User as UserIcon } from 'lucide-react';

export default function AdminModal({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      toast.error('Lỗi lấy danh sách người dùng!');
    }
  };

  const toggleRole = async (id: string, currentRole: string) => {
    if (!window.confirm(`Đổi quyền người dùng này thành ${currentRole === 'ADMIN' ? 'USER' : 'ADMIN'}?`)) return;
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${API_URL}/api/admin/users/${id}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã cập nhật quyền!');
      fetchUsers();
    } catch (err) {
      toast.error('Lỗi phân quyền!');
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Xóa VĨNH VIỄN người dùng này và mọi dữ liệu liên quan?')) return;
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa người dùng!');
      fetchUsers();
    } catch (err) {
      toast.error('Lỗi xóa người dùng!');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ width: '600px', maxWidth: '100%' }} onClick={e => e.stopPropagation()}>
        <h2>Quản lý người dùng (Admin)</h2>
        
        <div style={{ marginTop: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
          {users.map(u => (
            <div key={u.id} className="notification-card" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {u.fullName} {u.role === 'ADMIN' ? <Shield size={12} color="var(--primary)" /> : <UserIcon size={12} color="var(--text-muted)" />}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{u.username} | {u.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="form-button" style={{ marginTop: 0, padding: '6px 12px', fontSize: '12px', background: u.role === 'ADMIN' ? 'var(--bg-dark)' : 'var(--primary)', color: u.role === 'ADMIN' ? 'var(--text-main)' : 'white', border: u.role === 'ADMIN' ? '1px solid var(--border-color)' : 'none' }} onClick={() => toggleRole(u.id, u.role)}>
                  {u.role === 'ADMIN' ? 'Hạ quyền' : 'Cấp Admin'}
                </button>
                <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => deleteUser(u.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="form-button" style={{ width: '100%', marginTop: '20px' }} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}
