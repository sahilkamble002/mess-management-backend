const requiredJwtEnvVars = [
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRY",
]

const getMissingJwtEnvVars = () =>
  requiredJwtEnvVars.filter((envVar) => !process.env[envVar]?.trim())

export { getMissingJwtEnvVars }
