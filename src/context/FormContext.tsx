import React, { createContext, useState, useContext } from "react";
import type { MockExamSlot } from "../types/admission";

const FormContext = createContext<any>(null);

function createEmptyExamSlot(): MockExamSlot {
  return {
    examType: "",
    year: "2026",
    korean: { grade: "", percentile: "", standardScore: "" },
    math: { grade: "", percentile: "", standardScore: "" },
    english: "",
    inquiry1: "",
    inquiry2: "",
  };
}

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const [studentInfo, setStudentInfo] = useState({
    status: "",
    track: "",
    major: "",
    targetRegion: "",
  });

  const [essayInfo, setEssayInfo] = useState({
    reading: "",
    content_understanding: "",
    structure: "",
    expression: "",
    prompt_understanding: "",
    chart_score: 0,
    english_passage_score: 0,
    math_question_score: 0,
    feedback: "",
  });

  const [academicInfo, setAcademicInfo] = useState({
    gpaCore: "",
    gpaAll: "",
    mockExams: [
      createEmptyExamSlot(),
      createEmptyExamSlot(),
      createEmptyExamSlot(),
    ] as MockExamSlot[],
  });

  return (
    <FormContext.Provider
      value={{
        studentInfo,
        setStudentInfo,
        essayInfo,
        setEssayInfo,
        academicInfo,
        setAcademicInfo,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => useContext(FormContext);
