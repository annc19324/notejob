export default function ConfirmModal({ title, message, onConfirm, onClose }: { title: string, message: string, onConfirm: () => void, onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="form-button" style={{ background: 'var(--error)' }} onClick={onConfirm}>Đồng ý xóa</button>
          <button className="form-button" style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}
