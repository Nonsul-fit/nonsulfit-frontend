import React, { createContext, useContext, useMemo, useState } from "react";

interface AnalysisContextValue {
  analysisRunId: string | null;
  setAnalysisRunId: (analysisRunId: string | null) => void;
  clearAnalysisRunId: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export const AnalysisProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [analysisRunId, setAnalysisRunId] = useState<string | null>(null);

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
