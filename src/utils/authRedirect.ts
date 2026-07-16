export const createLoginRedirectPath = (destination: string) =>
  `/login?redirect=${encodeURIComponent(destination)}`;

export const getSafePostLoginPath = (
  redirect: string | null,
  fallback = "/home",
) => {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallback;
  }

  return redirect;
};
