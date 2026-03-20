const isProduction = process.env.NODE_ENV === "production"

export const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
}
