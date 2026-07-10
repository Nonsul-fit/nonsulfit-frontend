import React, { createContext, useContext, useMemo, useState } from "react";
import { ANALYSIS_RUN_ID_STORAGE_KEY } from "../api/analysis";

interface AnalysisContextValue {
  analysisRunId: string | null;
  setAnalysisRunId: (analysisRunId: string | null) => void;
  clearAnalysisRunId: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

const restoreAnalysisRunId = (): string | null => {
  if (typeof sessionStorage === "undefined") return null;

  return sessionStorage.getItem(ANALYSIS_RUN_ID_STORAGE_KEY);
};

export const AnalysisProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [analysisRunId, setAnalysisRunId] = useState<string | null>(
    restoreAnalysisRunId,
  );

  const value = useMemo(
    () => ({
      analysisRunId,
      setAnalysisRunId,
      clearAnalysisRunId: () => setAnalysisRunId(null),
    }),
    [analysisRunId],
  );

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);

  if (!context) {
    throw new Error("useAnalysisContext must be used within AnalysisProvider");
  }

  return context;
};
