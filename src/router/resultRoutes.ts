// analysisRunId -> analysis execution tracking only.
// reportId -> UUID for the primary Report API flow.
// publicId -> legacy /nonsulfit/result/{publicId} compatibility only; do not use outside legacy adapters.
// savedAnalysisReportId -> legacy adapter only; scheduled for removal in 4.2.
export const RESULT_DETAIL_ROUTE = "/result/:reportId";

export const buildResultRoute = (reportId: string): string =>
  `/result/${encodeURIComponent(reportId)}`;
