const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err?.code === 11000) {
    const duplicateFields = Object.keys(err.keyPattern || err.keyValue || {})
    const duplicateLabel =
      duplicateFields.length > 0 ? duplicateFields.join(", ") : "record"

    return res.status(409).json({
      success: false,
      message: `Duplicate value for ${duplicateLabel}`,
      errors: [],
    })
  }

  const statusCode = err?.statusCode || 500
  const message = err?.message || "Internal Server Error"
  const errors = Array.isArray(err?.errors) ? err.errors : []

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  })
}

export { errorHandler }
