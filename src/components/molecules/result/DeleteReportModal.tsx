import { useEffect, useRef, type ReactNode } from "react";

interface DeleteReportModalProps {
  isOpen: boolean;
  reportLabel?: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: ReactNode;
  confirmLabel?: string;
  pendingLabel?: string;
}

const DeleteReportModal = ({
  isOpen,
  reportLabel,
  isDeleting,
  onCancel,
  onConfirm,
  title = "이 분석 리포트를 삭제하시겠습니까?",
  description = "삭제한 리포트와 관련 상담 내역은 복구할 수 없습니다.",
  confirmLabel = "영구 삭제",
  pendingLabel = "삭제 중...",
}: DeleteReportModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) onCancel();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-report-title"
        aria-describedby="delete-report-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 id="delete-report-title" className="text-xl font-black text-gray-900">
          {title}
        </h2>
        {reportLabel && (
          <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm font-bold text-gray-700">
            {reportLabel}
          </p>
        )}
        <p
          id="delete-report-description"
          className="mt-4 text-sm leading-6 text-gray-600"
        >
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting && (
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white align-[-3px]" />
            )}
            {isDeleting ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReportModal;
