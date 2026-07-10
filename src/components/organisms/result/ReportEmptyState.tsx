interface ReportEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ReportEmptyState = ({
  title = "표시할 리포트가 없습니다.",
  description = "조건에 맞는 추천 결과가 없습니다.",
  actionLabel,
  onAction,
}: ReportEmptyStateProps) => {
  return (
    <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
      <p className="text-medium font-extrabold text-gray-700 mb-3">{title}</p>
      <p className="text-sm font-medium text-gray-400 mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-6 py-3 bg-primary text-white font-extrabold text-sm rounded-2xl shadow-md hover:opacity-90 transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default ReportEmptyState;
