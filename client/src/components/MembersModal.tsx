import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Trash2, Shield, User } from 'lucide-react';

export default function MembersModal({ projectId, onClose }: { projectId: string, onClose: () => void }) {
  const [owner, setOwner] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/board/project/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOwner(res.data.owner);
      setMembers(res.data.members);
    } catch (err) {
      toast.error('Lỗi lấy danh sách thành viên');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!window.confirm('Xóa thành viên này khỏi dự án?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/board/project/${projectId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã xóa thành viên!');
      fetchMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Lỗi xóa thành viên');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Thành viên dự án</h2>
        
        {owner && (
          <div className="notification-card" style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={owner.avatar || 'https://via.placeholder.com/32'} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {owner.fullName} <Shield size={12} color="var(--primary)" />
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chủ sở hữu</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          {members.map(m => (
            <div key={m.id} className="notification-card" style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={m.user.avatar || 'https://via.placeholder.com/32'} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{m.user.fullName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {m.status === 'PENDING' ? 'Chờ xác nhận...' : 'Thành viên'}
                  </div>
                </div>
              </div>
              <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => removeMember(m.user.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {members.length === 0 && <p className="text-muted">Chưa có thành viên nào khác.</p>}
        </div>

        <button className="form-button" style={{ width: '100%', marginTop: '20px' }} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}
