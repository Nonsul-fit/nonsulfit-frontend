export type AnalysisRunId = string;
export type ReportId = string;
export type PublicReportId = number;
export type DeleteReportIdentifier = ReportId | PublicReportId;

export const selectDeleteReportIdentifier = (report: {
  reportId?: string | null;
  publicId?: number | null;
}): DeleteReportIdentifier | null => {
  const reportId = report.reportId?.trim();
  const isUuid =
    reportId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      reportId,
    );
  if (isUuid) return reportId;
  return report.publicId ?? reportId ?? null;
};
