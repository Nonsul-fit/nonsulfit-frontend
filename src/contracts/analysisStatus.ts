export type AnalysisStatus =
  | "PENDING"
  | "PROCESSING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export interface AnalysisSessionStatus {
  analysisRunId: string;
  status: AnalysisStatus;
  reportId: string | null;
  publicId: number | null;
  contractWarnings: string[];
}

export class AnalysisStatusContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisStatusContractError";
  }
}
