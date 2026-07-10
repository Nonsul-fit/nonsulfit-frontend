export type ContractErrorType =
  | "ANALYSIS_RUN_ID_MISSING"
  | "ANALYSIS_STATUS_INVALID"
  | "COMPLETED_REPORT_ID_MISSING"
  | "REPORT_PAYLOAD_INVALID"
  | "REPORT_NOT_FOUND"
  | "REPORT_LIST_INVALID"
  | "CHAT_PAYLOAD_INVALID"
  | "NETWORK_ERROR"
  | "ANALYSIS_FAILED";

export type UserFacingErrorGroup =
  | "INPUT_OR_ID_ERROR"
  | "ANALYSIS_FAILED"
  | "REPORT_ERROR"
  | "CHAT_ERROR"
  | "NETWORK_ERROR";

export class ContractError extends Error {
  type: ContractErrorType;
  detail?: unknown;

  constructor(type: ContractErrorType, detail?: unknown) {
    super(type);
    this.name = "ContractError";
    this.type = type;
    this.detail = detail;
  }
}

export function toUserFacingGroup(
  type: ContractErrorType,
): UserFacingErrorGroup {
  switch (type) {
    case "ANALYSIS_RUN_ID_MISSING":
    case "COMPLETED_REPORT_ID_MISSING":
      return "INPUT_OR_ID_ERROR";
    case "ANALYSIS_FAILED":
    case "ANALYSIS_STATUS_INVALID":
      return "ANALYSIS_FAILED";
    case "REPORT_PAYLOAD_INVALID":
    case "REPORT_NOT_FOUND":
    case "REPORT_LIST_INVALID":
      return "REPORT_ERROR";
    case "CHAT_PAYLOAD_INVALID":
      return "CHAT_ERROR";
    case "NETWORK_ERROR":
      return "NETWORK_ERROR";
    default:
      return assertNever(type);
  }
}

const assertNever = (value: never): never => {
  throw new Error(`Unhandled contract error type: ${value}`);
};
