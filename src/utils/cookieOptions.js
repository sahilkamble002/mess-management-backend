const normalizeBoolean = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "true") {
    return true;
  }

  if (normalizedValue === "false") {
    return false;
  }

  return undefined;
};

const getCookieOptions = () => {
  const configuredSameSite = process.env.COOKIE_SAME_SITE?.trim().toLowerCase();
  const sameSite = ["lax", "strict", "none"].includes(configuredSameSite)
    ? configuredSameSite
    : process.env.NODE_ENV === "production"
      ? "none"
      : "lax";

  const configuredSecure = normalizeBoolean(process.env.COOKIE_SECURE);
  const secure = configuredSecure !== undefined
    ? configuredSecure
    : sameSite === "none" || process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };
};

export { getCookieOptions };
