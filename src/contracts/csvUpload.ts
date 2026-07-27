export interface CsvUploadResponse {
  input: {
    essayCompetency: {
      reading: number | null;
      contentUnderstanding: number | null;
      promptUnderstanding: number | null;
      structure: number | null;
      expression: number | null;
    } | null;
  };
  csvImport: {
    fileName: string;
    encoding: string;
    importedRowCount: number;
    updatedFields: string[];
  };
  analysis: null;
  analysisRunId: null;
  status: null;
}

export interface CsvUploadError {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

export interface CsvCompetencyValues {
  reading: number;
  contentUnderstanding: number;
  promptUnderstanding: number;
  structure: number;
  expression: number;
}
