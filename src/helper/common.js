const response = (res, result, status, message, pagination) => {
  const resultPrint = {
    status: 'success',
    statusCode: status,
    data: result,
    message: message || null,
    pagination: pagination || {}
  }
  res.status(status).json(resultPrint)
}

module.exports = {
  response
}
