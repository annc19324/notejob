import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { LogOut, Plus, Trash2, UserCircle, Settings, Camera, LayoutGrid, ChevronDown, Check, UserPlus, Pencil, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import SettingsModal from './SettingsModal';
import InviteModal from './InviteModal';
import WorkspaceModal from './WorkspaceModal';
import PromptModal from './PromptModal';
import ConfirmModal from './ConfirmModal';
import SocialDrawer from './SocialDrawer';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function Board() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>({ currentProject: null, allProjects: [] });
  const [user, setUser] = useState<any>(null);
  
  const [newTaskContent, setNewTaskContent] = useState('');
  const [addingToList, setAddingToList] = useState<string | null>(null);
  
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showSocialDrawer, setShowSocialDrawer] = useState(false);
  
  const [confirmState, setConfirmState] = useState<any>({ isOpen: false });
  const [promptState, setPromptState] = useState<any>({ isOpen: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
      fetchBoardData();
    }
  }, [navigate]);

  const fetchBoardData = async (projectId?: string) => {
    try {
      const token = localStorage.getItem('token');
      const url = projectId 
        ? (import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/board?projectId=${projectId}`
        : (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/board';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const switchWorkspace = (projectId: string) => {
    fetchBoardData(projectId);
    setIsWorkspaceOpen(false);
  };

  const handleCreateWorkspace = async (name: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/board/project', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Đã tạo không gian làm việc!');
      fetchBoardData(res.data.id);
      setShowWorkspaceModal(false);
    } catch (err) {
      toast.error('Lỗi tạo không gian làm việc');
    }
  };

  const handleEditWorkspace = () => {
    const currentName = data.currentProject?.name;
    setPromptState({
      isOpen: true,
      title: "Nhập tên mới cho không gian làm việc:",
      defaultValue: currentName,
      onConfirm: async (newName: string) => {
        setPromptState({ isOpen: false });
        if (!newName || newName === currentName) return;
        try {
          const token = localStorage.getItem('token');
          await axios.put((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/board/project/${data.currentProject.id}`, { name: newName }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Đã đổi tên không gian!');
          fetchBoardData(data.currentProject.id);
        } catch (err) {
          toast.error('Lỗi đổi tên không gian!');
        }
      }
    });
  };

  const handleDeleteWorkspace = () => {
    setConfirmState({
      isOpen: true,
      title: "Xóa không gian làm việc",
      message: "BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ KHÔNG GIAN NÀY VÀ CÁC THẺ BÊN TRONG? Hành động này không thể hoàn tác.",
      onConfirm: async () => {
        setConfirmState({ isOpen: false });
        try {
          const token = localStorage.getItem('token');
          await axios.delete((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/board/project/${data.currentProject.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success('Đã xóa không gian!');
          fetchBoardData();
        } catch (err) {
          toast.error('Lỗi xóa không gian!');
        }
      }
    });
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const currentProject = data.currentProject;
    const sourceList = currentProject.lists.find((list: any) => list.id === source.droppableId);
    const destList = currentProject.lists.find((list: any) => list.id === destination.droppableId);

    if (!sourceList || !destList) return;

    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(sourceList.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      const newLists = currentProject.lists.map((list: any) => {
        if (list.id === sourceList.id) return { ...list, tasks: newTasks };
        return list;
      });
      setData({ ...data, currentProject: { ...currentProject, lists: newLists } });
    } else {
      const sourceTasks = Array.from(sourceList.tasks);
      const destTasks = Array.from(destList.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, removed);

      const newLists = currentProject.lists.map((list: any) => {
        if (list.id === sourceList.id) return { ...list, tasks: sourceTasks };
        if (list.id === destList.id) return { ...list, tasks: destTasks };
        return list;
      });
      setData({ ...data, currentProject: { ...currentProject, lists: newLists } });
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/board/task/move', {
        taskId: draggableId,
        sourceListId: source.droppableId,
        destListId: destination.droppableId,
        sourceIndex: source.index,
        destIndex: destination.index
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      toast.error('Lỗi khi di chuyển thẻ!');
      fetchBoardData(currentProject.id); // Revert
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAddList = async () => {
    if (!newListTitle.trim()) {
      setIsAddingList(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/board/list', {
        projectId: data.currentProject.id,
        title: newListTitle
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewListTitle('');
      setIsAddingList(false);
      fetchBoardData(data.currentProject.id);
      toast.success('Đã thêm danh sách!');
    } catch (err) {
      toast.error('Lỗi thêm danh sách!');
    }
  };

  const handleDeleteList = (listId: string) => {
    setConfirmState({
      isOpen: true,
      title: "Xóa danh sách",
      message: "Bạn có chắc chắn muốn xóa danh sách này cùng toàn bộ thẻ bên trong?",
      onConfirm: async () => {
        setConfirmState({ isOpen: false });
        try {
          const token = localStorage.getItem('token');
          await axios.delete((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/board/list/${listId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchBoardData(data.currentProject.id);
          toast.success('Đã xóa danh sách!');
        } catch (err) {
          toast.error('Lỗi xóa danh sách!');
        }
      }
    });
  };

  const handleAddTask = async (listId: string) => {
    if (!newTaskContent.trim()) {
      setAddingToList(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/board/task', {
        listId,
        content: newTaskContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTaskContent('');
      setAddingToList(null);
      fetchBoardData(data.currentProject.id);
      toast.success('Đã thêm thẻ!');
    } catch (err) {
      toast.error('Lỗi thêm thẻ!');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmState({
      isOpen: true,
      title: "Xóa thẻ công việc",
      message: "Thẻ này sẽ bị xóa vĩnh viễn khỏi danh sách. Tiếp tục?",
      onConfirm: async () => {
        setConfirmState({ isOpen: false });
        try {
          const token = localStorage.getItem('token');
          await axios.delete((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/board/task/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          fetchBoardData(data.currentProject.id);
          toast.success('Đã xóa thẻ!');
        } catch (err) {
          toast.error('Lỗi xóa thẻ!');
        }
      }
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading('Đang tải ảnh lên...');
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/user/avatar', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const updatedUser = { ...user, avatar: res.data.avatar };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Cập nhật ảnh đại diện thành công!', { id: toastId });
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Không thể tải ảnh lên. Hãy thử lại!', { id: toastId });
    }
  };

  return (
    <div className="board-container" onClick={() => { setIsProfileOpen(false); setIsWorkspaceOpen(false); }}>
      <nav className="board-nav">
        <div className="nav-left">
          <div className="logo-container" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
            <img src="/logo.png" alt="NoteJob Logo" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
          </div>
          
          <div className="dropdown-container" onClick={(e) => e.stopPropagation()}>
            <button className="nav-btn" onClick={() => { setIsWorkspaceOpen(!isWorkspaceOpen); setIsProfileOpen(false); }}>
              Các không gian làm việc <ChevronDown size={14} />
            </button>
            {isWorkspaceOpen && (
              <div className="dropdown-menu dropdown-menu-left">
                <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                  KHÔNG GIAN CỦA BẠN
                </div>
                {data.allProjects?.map((proj: any) => (
                  <button key={proj.id} className="dropdown-item" onClick={() => switchWorkspace(proj.id)}>
                    <LayoutGrid size={16} />
                    <span style={{ flex: 1 }}>{proj.name}</span>
                    {proj.id === data.currentProject?.id && <Check size={16} />}
                  </button>
                ))}
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => { setIsWorkspaceOpen(false); setShowWorkspaceModal(true); }}>
                  <Plus size={16} /> Tạo không gian mới
                </button>
              </div>
            )}
          </div>
          <button className="nav-btn create-btn" onClick={() => setShowWorkspaceModal(true)}>Tạo mới</button>
        </div>
        
        <div className="nav-right">
          <button className="icon-btn" onClick={() => setShowSocialDrawer(true)}>
            <Bell size={20} />
          </button>
          
          <div className="dropdown-container" onClick={(e) => e.stopPropagation()}>
            <div className="nav-user-btn" onClick={() => { setIsProfileOpen(!isProfileOpen); setIsWorkspaceOpen(false); }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={32} />
              )}
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{user?.username}</span>
            </div>
            
            {isProfileOpen && (
              <div className="dropdown-menu">
                <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <UserCircle size={40} />
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{user?.fullName}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user?.email}</span>
                  </div>
                </div>
                <button className="dropdown-item" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={16} /> Đổi ảnh đại diện
                </button>
                <button className="dropdown-item" onClick={() => { setIsProfileOpen(false); setShowSettings(true); }}>
                  <Settings size={16} /> Cài đặt
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleLogout} style={{ color: 'var(--error)' }}>
                  <LogOut size={16} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarUpload} 
            style={{ display: 'none' }} 
            accept="image/*"
          />
        </div>
      </nav>

      <div className="board-header">
        <h1>{data.currentProject?.name}</h1>
        {data.currentProject && (
          <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
            <button className="icon-btn" onClick={handleEditWorkspace} title="Đổi tên">
              <Pencil size={16} />
            </button>
            <button className="icon-btn" onClick={handleDeleteWorkspace} title="Xóa không gian" style={{ color: 'var(--error)' }}>
              <Trash2 size={16} />
            </button>
            <div style={{ width: '1px', background: 'var(--border-color)', margin: '0 8px' }}></div>
            <button className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowInviteModal(true)}>
              <UserPlus size={16} /> Mời thành viên
            </button>
          </div>
        )}
      </div>

      <div className="board-canvas">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="lists-container">
            {data.currentProject?.lists?.map((list: any) => (
              <div key={list.id} className="list-wrapper">
                <div className="list-content">
                  <div className="list-header">
                    <h2>{list.title}</h2>
                    <button className="icon-btn" onClick={() => handleDeleteList(list.id)} title="Xóa danh sách">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <Droppable droppableId={list.id}>
                    {(provided) => (
                      <div 
                        className="tasks-container"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {list.tasks?.map((task: any, index: number) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                className="task-card"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <span style={{ flex: 1 }}>{task.content}</span>
                                  <Trash2 
                                    size={14} 
                                    color="var(--error)" 
                                    style={{ cursor: 'pointer', opacity: 0.5, marginLeft: '8px' }} 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                  />
                                </div>
                                {task.createdAt && (
                                  <span className="task-card-time">
                                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: vi })}
                                  </span>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div className="list-footer">
                    {addingToList === list.id ? (
                      <div className="add-task-form" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        <input 
                          type="text" 
                          autoFocus
                          value={newTaskContent}
                          onChange={(e) => setNewTaskContent(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddTask(list.id);
                            if (e.key === 'Escape') setAddingToList(null);
                          }}
                          placeholder="Nhập tiêu đề thẻ..."
                          style={{
                            padding: '8px', 
                            borderRadius: '4px', 
                            border: '1px solid var(--primary)', 
                            background: 'var(--bg-dark)', 
                            color: 'var(--text-main)'
                          }}
                        />
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button 
                            onClick={() => handleAddTask(list.id)}
                            style={{background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                          >Thêm thẻ</button>
                          <button 
                            onClick={() => setAddingToList(null)}
                            style={{background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer'}}
                          >Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <button className="add-task-btn" onClick={() => {
                        setAddingToList(list.id);
                        setNewTaskContent('');
                      }}>
                        <Plus size={16} /> Thêm thẻ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="list-wrapper">
              {isAddingList ? (
                <div className="list-content" style={{ padding: '12px', gap: '8px' }}>
                  <input 
                    type="text" 
                    autoFocus
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddList();
                      if (e.key === 'Escape') setIsAddingList(false);
                    }}
                    placeholder="Nhập tiêu đề danh sách..."
                    style={{
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid var(--primary)', 
                      background: 'var(--bg-dark)', 
                      color: 'var(--text-main)'
                    }}
                  />
                  <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                    <button 
                      onClick={handleAddList}
                      style={{background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
                    >Thêm danh sách</button>
                    <button 
                      onClick={() => setIsAddingList(false)}
                      style={{background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer'}}
                    >Hủy</button>
                  </div>
                </div>
              ) : (
                <button className="add-list-btn" onClick={() => {
                  setIsAddingList(true);
                  setNewListTitle('');
                }}>
                  <Plus size={16} /> <span>Thêm danh sách</span>
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>
      
      {showSettings && <SettingsModal user={user} onClose={() => setShowSettings(false)} onUpdate={(u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); }} />}
      {showInviteModal && data.currentProject && <InviteModal projectId={data.currentProject.id} onClose={() => setShowInviteModal(false)} />}
      {showWorkspaceModal && <WorkspaceModal onCreate={handleCreateWorkspace} onClose={() => setShowWorkspaceModal(false)} />}
      {confirmState.isOpen && <ConfirmModal title={confirmState.title} message={confirmState.message} onConfirm={confirmState.onConfirm} onClose={() => setConfirmState({ isOpen: false })} />}
      {promptState.isOpen && <PromptModal title={promptState.title} defaultValue={promptState.defaultValue} onConfirm={promptState.onConfirm} onClose={() => setPromptState({ isOpen: false })} />}
      {showSocialDrawer && <SocialDrawer onClose={() => setShowSocialDrawer(false)} />}
    </div>
  );
}
