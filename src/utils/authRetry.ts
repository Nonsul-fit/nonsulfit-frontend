interface AuthenticationError {
  response?: { status?: number; data?: unknown };
}

export const shouldRefreshAccessToken = (
  error: AuthenticationError,
  alreadyRetried: boolean,
): boolean => {
  if (alreadyRetried) return false;
  const data = error.response?.data;
  const record = data && typeof data === "object" ? data as Record<string, unknown> : null;
  const nested = record?.error && typeof record.error === "object"
    ? record.error as Record<string, unknown>
    : null;
  return error.response?.status === 401 ||
    record?.code === "INVALID_ACCESS_TOKEN" ||
    nested?.code === "INVALID_ACCESS_TOKEN";
};
