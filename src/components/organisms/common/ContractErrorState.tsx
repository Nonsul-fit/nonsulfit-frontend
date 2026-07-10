import {
  toUserFacingGroup,
  type ContractError,
  type UserFacingErrorGroup,
} from "../../../errors/contractErrors";

interface ContractErrorStateProps {
  error: ContractError;
  onRetry?: () => void;
}

const messageByGroup: Record<
  UserFacingErrorGroup,
  { title: string; description: string }
> = {
  INPUT_OR_ID_ERROR: {
    title: "분석 정보를 확인할 수 없습니다.",
    description: "다시 제출하거나 목록에서 리포트를 선택해 주세요.",
  },
  ANALYSIS_FAILED: {
    title: "분석을 완료하지 못했습니다.",
    description: "입력 값을 확인한 뒤 다시 시도해 주세요.",
  },
  REPORT_ERROR: {
    title: "리포트를 불러올 수 없습니다.",
    description: "리포트 데이터 형식이 올바르지 않거나 찾을 수 없습니다.",
  },
  CHAT_ERROR: {
    title: "채팅 응답을 표시할 수 없습니다.",
    description: "잠시 후 다시 질문해 주세요.",
  },
  NETWORK_ERROR: {
    title: "연결 상태를 확인해 주세요.",
    description: "서버와 통신하는 중 문제가 발생했습니다.",
  },
};

const ContractErrorState = ({ error, onRetry }: ContractErrorStateProps) => {
  const group = toUserFacingGroup(error.type);
  const message = messageByGroup[group];

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 py-16 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
        !
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-900">{message.title}</h2>
      <p className="mb-8 text-sm font-medium text-gray-500">
        {message.description}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white"
        >
          다시 시도하기
        </button>
      )}
    </div>
  );
};

export default ContractErrorState;
