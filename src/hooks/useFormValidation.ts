export const useFormValidation = () => {
  const validateRequired = (
    fields: Record<string, any>,
    errorMessage: string,
  ) => {
    const hasEmptyField = Object.values(fields).some((value) => !value);

    if (hasEmptyField) {
      alert(errorMessage);
      return false;
    }
    return true;
  };

  return { validateRequired };
};
