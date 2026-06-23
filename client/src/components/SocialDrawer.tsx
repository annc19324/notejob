import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { UserPlus, MessageCircle, X, Check, Search } from 'lucide-react';

export default function SocialDrawer({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'FRIENDS' | 'MESSAGES' | 'NOTIFICATIONS'>('NOTIFICATIONS');
  const [notifications, setNotifications] = useState<any>({ friendRequests: [], projectInvites: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/social/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/social/users/search?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(res.data);
    } catch (err) {
      toast.error('Lỗi tìm kiếm');
    }
  };

  const sendFriendReq = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/social/friends/request', { targetId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã gửi yêu cầu kết bạn!');
    } catch (err) {
      toast.error('Lỗi hoặc đã gửi rồi!');
    }
  };

  const acceptFriend = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/social/friends/accept', { id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã chấp nhận kết bạn!');
      fetchNotifications();
    } catch (err) {
      toast.error('Lỗi');
    }
  };

  const rejectFriend = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/social/friends/reject', { id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {}
  };

  const acceptProject = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/social/projects/accept-invite', { id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã vào dự án! Tải lại trang để xem.');
      fetchNotifications();
    } catch (err) {
      toast.error('Lỗi');
    }
  };

  const rejectProject = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/social/projects/reject-invite', { id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {}
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>Kết nối</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="drawer-tabs">
          <button className={activeTab === 'NOTIFICATIONS' ? 'active' : ''} onClick={() => setActiveTab('NOTIFICATIONS')}>Thông báo</button>
          <button className={activeTab === 'FRIENDS' ? 'active' : ''} onClick={() => setActiveTab('FRIENDS')}>Tìm bạn bè</button>
          <button className={activeTab === 'MESSAGES' ? 'active' : ''} onClick={() => setActiveTab('MESSAGES')}>Tin nhắn</button>
        </div>

        <div className="drawer-body">
          {activeTab === 'NOTIFICATIONS' && (
            <div>
              <h3>Yêu cầu kết bạn</h3>
              {notifications.friendRequests.length === 0 && <p className="text-muted">Không có yêu cầu nào</p>}
              {notifications.friendRequests.map((req: any) => (
                <div key={req.id} className="notification-card">
                  <span>{req.user1.fullName} muốn kết bạn</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" style={{ color: 'var(--success)' }} onClick={() => acceptFriend(req.id)}><Check size={16} /></button>
                    <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => rejectFriend(req.id)}><X size={16} /></button>
                  </div>
                </div>
              ))}
              
              <h3 style={{ marginTop: '20px' }}>Lời mời dự án</h3>
              {notifications.projectInvites.length === 0 && <p className="text-muted">Không có lời mời nào</p>}
              {notifications.projectInvites.map((inv: any) => (
                <div key={inv.id} className="notification-card">
                  <span>Mời vào dự án: <b>{inv.project.name}</b></span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" style={{ color: 'var(--success)' }} onClick={() => acceptProject(inv.id)}><Check size={16} /></button>
                    <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => rejectProject(inv.id)}><X size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'FRIENDS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  className="form-input" 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Tìm theo tên hoặc email..." 
                  style={{ flex: 1 }}
                />
                <button className="form-button" style={{ marginTop: 0 }} onClick={handleSearch}><Search size={16} /></button>
              </div>
              <div style={{ marginTop: '12px' }}>
                {searchResults.map((u: any) => (
                  <div key={u.id} className="notification-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={u.avatar || 'https://via.placeholder.com/32'} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{u.fullName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </div>
                    </div>
                    <button className="icon-btn" onClick={() => sendFriendReq(u.id)}><UserPlus size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'MESSAGES' && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>Chức năng tin nhắn đang được hoàn thiện.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
