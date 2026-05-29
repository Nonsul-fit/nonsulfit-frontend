export interface UniversityProgram {
  program_id: string;
  university_id: string;
  display: {
    university: string;
    campus: string;
    track: string;
    academic_field: string;
    difficulty_label?: string;
  };
  features: {
    competition_rate_latest: number;
    competition_rate_avg_recent_3y: number;
    difficulty_score: number | null;
    essay_complexity_score: number;
    recommendation_difficulty_score: number;
  };
  text: {
    comment: string | null;
    notes: string[];
    exam_date_2026: string;
    selection_method_text: string;
    essay_questions: string;
  };
}
