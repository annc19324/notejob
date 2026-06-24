import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutGrid, Plus, LogOut } from 'lucide-react';
import WorkspaceModal from './WorkspaceModal';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/board`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data.allProjects || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Lỗi tải danh sách dự án');
      }
    }
  };

  const handleCreateProject = async (name: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/board/project`, { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã tạo không gian!');
      setShowWorkspaceModal(false);
      navigate(`/board/${res.data.id}`);
    } catch (err) {
      toast.error('Lỗi tạo không gian!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="board-container">
      <nav className="board-nav">
        <div className="logo-container" style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="NoteJob Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
          <span>NoteJob</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>{user?.fullName}</span>
          <button className="nav-btn" onClick={handleLogout} style={{ color: 'var(--error)' }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </nav>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ marginBottom: '30px' }}>Các không gian làm việc của bạn</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {projects.map(proj => (
            <div 
              key={proj.id} 
              style={{
                backgroundColor: 'var(--bg-card)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
              onClick={() => navigate(`/board/${proj.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <LayoutGrid size={24} color="var(--primary)" />
              {proj.name}
            </div>
          ))}

          <div 
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px dashed var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 'bold',
              fontSize: '16px',
              color: 'var(--text-muted)'
            }}
            onClick={() => setShowWorkspaceModal(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <Plus size={24} /> Tạo mới
          </div>
        </div>
      </div>

      {showWorkspaceModal && <WorkspaceModal onClose={() => setShowWorkspaceModal(false)} onCreate={handleCreateProject} />}
    </div>
  );
}
