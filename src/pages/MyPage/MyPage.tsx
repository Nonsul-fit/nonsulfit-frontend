import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { withdrawMembership } from "../../api/auth";
import { clearAuthorizationHeader } from "../../api/axios";
import WithdrawMembershipModal from "../../components/molecules/account/WithdrawMembershipModal";
import { useAuth } from "../../context/AuthContext";
import { queryClient } from "../../queryClient";
import { clearAuthStorage } from "../../utils/authStorage";

const MyPage = () => {
  const navigate = useNavigate();
  const { resetAuthState } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-black text-gray-900">마이페이지</h1>
      <div className="mt-10 border-t border-gray-200 pt-6">
        <h2 className="font-bold text-red-700">계정 삭제</h2>
        <p className="mt-2 text-sm text-gray-500">회원탈퇴 후 계정은 복구할 수 없습니다.</p>
        {error && <p role="alert" className="mt-3 text-sm font-bold text-red-600">{error}</p>}
        <button type="button" disabled={isSubmitting} onClick={() => setIsOpen(true)} className="mt-4 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 disabled:opacity-50">회원탈퇴</button>
      </div>
      <WithdrawMembershipModal isOpen={isOpen} isSubmitting={isSubmitting} onCancel={() => setIsOpen(false)} onConfirm={handleConfirm} />
    </section>
  );
};

export default MyPage;
