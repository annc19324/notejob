import { useState } from 'react';

export default function PromptModal({ title, defaultValue, onConfirm, onClose }: { title: string, defaultValue: string, onConfirm: (val: string) => void, onClose: () => void }) {
  const [val, setVal] = useState(defaultValue);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="form-group">
          <input 
            className="form-input" 
            value={val} 
            onChange={e => setVal(e.target.value)} 
            autoFocus
            onKeyDown={e => e.key === 'Enter' && onConfirm(val)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="form-button" onClick={() => onConfirm(val)}>Xác nhận</button>
          <button className="form-button" style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
