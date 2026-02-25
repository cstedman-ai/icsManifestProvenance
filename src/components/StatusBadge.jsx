const colors = {
  issued: { bg: '#dbeafe', color: '#1e40af' },
  shipped: { bg: '#fef3c7', color: '#92400e' },
  received: { bg: '#d1fae5', color: '#065f46' },
  complete: { bg: '#d1fae5', color: '#065f46' },
  partial: { bg: '#fef3c7', color: '#92400e' },
  pending: { bg: '#f3f4f6', color: '#374151' },
  in_progress: { bg: '#e0e7ff', color: '#3730a3' },
  discrepancy: { bg: '#fee2e2', color: '#991b1b' },
  good: { bg: '#d1fae5', color: '#065f46' },
  damaged: { bg: '#fee2e2', color: '#991b1b' },
};

export default function StatusBadge({ status }) {
  const style = colors[status] || colors.pending;
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
