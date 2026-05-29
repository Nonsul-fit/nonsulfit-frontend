import { useState, useCallback } from "react";

export const useForm = <T>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback(() => setValues(initialValues), [initialValues]);

  return { values, handleChange, setValues, reset };
};
