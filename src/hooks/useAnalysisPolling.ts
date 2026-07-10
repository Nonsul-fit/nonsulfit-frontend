import { useEffect, useRef, useState } from "react";
import { fetchAnalysisStatus } from "../api/analysis";
import type { AnalysisStatus } from "../contracts/analysisStatus";

export type PollingError =
  | { type: "TIMEOUT" }
  | { type: "MAX_ERRORS_EXCEEDED"; cause: unknown }
  | { type: "ANALYSIS_FAILED" };

interface AnalysisPollingOptions {
  intervalMs?: number;
  timeoutMs?: number;
  maxConsecutiveErrors?: number;
}

interface AnalysisPollingState {
  status: AnalysisStatus | "IDLE";
  reportId: string | null;
  error: PollingError | null;
}

export function useAnalysisPolling(
  analysisRunId: string | null,
  options?: AnalysisPollingOptions,
): AnalysisPollingState {
  const [state, setState] = useState<AnalysisPollingState>({
    status: "IDLE",
    reportId: null,
    error: null,
  });
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!analysisRunId) {
      setState({ status: "IDLE", reportId: null, error: null });
      return;
    }

    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let consecutiveErrors = 0;
    let lastError: unknown = null;
    const startedAt = Date.now();
    const intervalMs = options?.intervalMs ?? 3000;
    const timeoutMs = options?.timeoutMs ?? 120000;
    const maxConsecutiveErrors = options?.maxConsecutiveErrors ?? 3;

    setState({ status: "IDLE", reportId: null, error: null });

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const scheduleNext = () => {
      clearTimer();
      timer = setTimeout(() => {
        void poll();
      }, intervalMs);
    };

    const stopWithError = (error: PollingError) => {
      clearTimer();
      setState((prev) => ({ ...prev, error }));
    };

    const poll = async () => {
      if (isCancelled || inFlightRef.current) return;

      if (Date.now() - startedAt >= timeoutMs) {
        stopWithError({ type: "TIMEOUT" });
        return;
      }

      inFlightRef.current = true;

      try {
        const result = await fetchAnalysisStatus(analysisRunId);
        if (isCancelled) return;

        consecutiveErrors = 0;
        lastError = null;

        if (result.status === "FAILED") {
          clearTimer();
          setState({
            status: result.status,
            reportId: null,
            error: { type: "ANALYSIS_FAILED" },
          });
          return;
        }

        if (result.status === "COMPLETED") {
          clearTimer();
          setState({
            status: result.status,
            reportId: result.reportId,
            error: null,
          });
          return;
        }

        setState({
          status: result.status,
          reportId: null,
          error: null,
        });
        scheduleNext();
      } catch (error) {
        if (isCancelled) return;

        consecutiveErrors += 1;
        lastError = error;

        if (consecutiveErrors >= maxConsecutiveErrors) {
          stopWithError({
            type: "MAX_ERRORS_EXCEEDED",
            cause: lastError,
          });
          return;
        }

        setState((prev) => ({ ...prev, error: null }));
        scheduleNext();
      } finally {
        inFlightRef.current = false;
      }
    };

    void poll();

    return () => {
      isCancelled = true;
      clearTimer();
      inFlightRef.current = false;
    };
  }, [
    analysisRunId,
    options?.intervalMs,
    options?.maxConsecutiveErrors,
    options?.timeoutMs,
  ]);

  return state;
}
