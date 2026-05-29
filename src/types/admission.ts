export interface DetailedScore {
  grade: string;
  percentile: string;
  standardScore: string;
}

export interface MockExamSlot {
  examType: string;
  year: string;
  korean: DetailedScore;
  math: DetailedScore;
  english: string;
  inquiry1: string;
  inquiry2: string;
}
