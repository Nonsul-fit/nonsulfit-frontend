import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { withdrawMembership } from "../../api/auth";
import { clearAuthorizationHeader } from "../../api/axios";
import DeleteReportModal from "../../components/molecules/result/DeleteReportModal";
import { useAuth } from "../../context/AuthContext";
import { queryClient } from "../../queryClient";
import { clearAuthStorage } from "../../utils/authStorage";

const MyPage = () => {
  const navigate = useNavigate();
  const { resetAuthState } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const clearSessionAndRedirect = () => {
    clearAuthStorage();
    resetAuthState();
    queryClient.clear();
    clearAuthorizationHeader();
    navigate("/login", { replace: true });
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    try {
      await withdrawMembership();
      setShowSuccessToast(true);
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      clearSessionAndRedirect();
    } catch (requestError) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        clearSessionAndRedirect();
        return;
      }
      setError("회원탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl space-y-8 px-4 sm:px-0">
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-black text-gray-900">마이페이지</h1>
      </div>
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-black text-gray-900">계정 관리</h2>
        <div className="my-5 border-t border-gray-200" />
        <h3 className="font-bold text-red-700">회원탈퇴</h3>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="font-black">⚠ 회원탈퇴 시</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 leading-6">
            <li>저장된 분석 리포트를 다시 볼 수 없습니다.</li>
            <li>로그인 상태가 즉시 종료됩니다.</li>
            <li>이 작업은 되돌릴 수 없습니다.</li>
          </ul>
        </div>
        {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
        <button type="button" disabled={isSubmitting} onClick={() => setIsOpen(true)} className="mt-5 w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">회원탈퇴</button>
      </div>
      {showSuccessToast && <div role="status" className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-xl">회원탈퇴가 완료되었습니다.</div>}
      <DeleteReportModal
        isOpen={isOpen}
        isDeleting={isSubmitting}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="회원탈퇴"
        description={<>회원탈퇴를 진행하면 로그인이 즉시 해제되며 이 작업은 되돌릴 수 없습니다.<br /><br />정말 탈퇴하시겠습니까?</>}
        confirmLabel="회원탈퇴"
        pendingLabel="처리 중..."
      />
    </section>
  );
};

export default MyPage;
