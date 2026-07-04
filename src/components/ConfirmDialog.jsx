export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>No</button>
          <button className="btn btn-danger" onClick={onConfirm}>Yes</button>
        </div>
      </div>
    </div>
  );
}
