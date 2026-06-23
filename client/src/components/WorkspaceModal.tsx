import { useState } from 'react';

export default function WorkspaceModal({ onCreate, onClose }: { onCreate: (name: string) => void, onClose: () => void }) {
  const [name, setName] = useState('');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Tạo không gian làm việc</h2>
        <div className="form-group">
          <label className="form-label">Tên không gian</label>
          <input 
            className="form-input" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Ví dụ: Dự án Alpha"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && onCreate(name)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="form-button" onClick={() => onCreate(name)}>Tạo mới</button>
          <button className="form-button" style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
