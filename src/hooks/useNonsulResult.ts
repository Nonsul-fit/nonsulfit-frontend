import { useEffect, useState } from "react";
import { fetchReportDetail } from "../api/reports";
import type { ReportMappingResult } from "../contracts/reportResponse";

export function useNonsulResult(reportId: string): {
  result: ReportMappingResult | null;
  isLoading: boolean;
  networkError: unknown | null;
} {
  const [result, setResult] = useState<ReportMappingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkError, setNetworkError] = useState<unknown | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchBackendData = async () => {
      setIsLoading(true);
      setNetworkError(null);

      try {
        if (!reportId) {
          if (!ignore) {
            setResult(null);
          }
          return;
        }

        const reportResult = await fetchReportDetail(reportId);

        if (!ignore) {
          setResult(reportResult);
        }
      } catch (error) {
        if (!ignore) {
          setResult(null);
          setNetworkError(error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void fetchBackendData();

    return () => {
      ignore = true;
    };
  }, [reportId]);

  return { result, isLoading, networkError };
}
