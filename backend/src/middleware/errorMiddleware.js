const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Mongoose duplicate key error
  let message = err.message;
  let errors = undefined;
  
  if (err.code === 11000) {
    res.status(400);
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered: ${field}. Please use another value.`;
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    res.status(400);
    message = 'Validation Error';
    errors = Object.values(err.errors).map(val => val.message);
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400);
    message = `Resource not found with id of ${err.value}`;
  }

  res.status(res.statusCode || 500).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = { notFound, errorHandler };
