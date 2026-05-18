import { useState, useCallback } from "react";

// T는 다양한 형태의 데이터(로그인용, 가입용)를 받기 위한 제네릭입니다.
export const useForm = <T>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);

  // 입력값이 변할 때 호출되는 함수
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // 폼 초기화가 필요할 때 사용 (예: 가입 완료 후)
  const reset = useCallback(() => setValues(initialValues), [initialValues]);

  return { values, handleChange, setValues, reset };
};
