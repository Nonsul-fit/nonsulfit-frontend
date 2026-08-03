interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const WithdrawMembershipModal = ({ isOpen, isSubmitting, onCancel, onConfirm }: Props) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" role="presentation">
      <div role="alertdialog" aria-modal="true" aria-labelledby="withdraw-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="withdraw-title" className="text-xl font-black text-gray-900">회원탈퇴를 진행하시겠습니까?</h2>
        <p className="mt-4 text-sm leading-6 text-gray-600">탈퇴 후 계정은 복구할 수 없습니다.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={isSubmitting} onClick={onCancel} className="rounded-lg border px-4 py-2.5 text-sm font-bold disabled:opacity-50">취소</button>
          <button type="button" disabled={isSubmitting} onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{isSubmitting ? "탈퇴 중..." : "회원탈퇴"}</button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawMembershipModal;
