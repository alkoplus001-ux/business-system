const notFound = (req, res, next) => {
  res.status(404);
  throw new Error(`Not Found - ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  res.status(res.statusCode || 500).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };
