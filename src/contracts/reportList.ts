export interface NormalizedReportList {
  items: ReportListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    hasNext: boolean;
  } | null;
}

export interface ReportListItem {
  reportId: string;
  publicId: number | null;
  title: string | null;
  createdAt: Date | null;
  updatedAt?: string;
  [key: string]: unknown;
}
