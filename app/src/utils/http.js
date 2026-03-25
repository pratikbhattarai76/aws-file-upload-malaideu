const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

const getFlash = (req) => ({
  success: typeof req.query.success === "string" ? req.query.success : "",
  error: typeof req.query.error === "string" ? req.query.error : "",
});

const redirectWithMessage = (res, pathname, type, message) => {
  const params = new URLSearchParams();

  if (type && message) {
    params.set(type, message);
  }

  const query = params.toString();
  return res.redirect(query ? `${pathname}?${query}` : pathname);
};

module.exports = {
  asyncHandler,
  getFlash,
  redirectWithMessage,
};
