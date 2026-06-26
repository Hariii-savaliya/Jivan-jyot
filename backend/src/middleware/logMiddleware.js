const ActivityLog = require('../models/ActivityLog');

const sanitizeBody = (body) => {
  if (!body) return body;
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'confirmPassword', 'token'];
  sensitiveFields.forEach(field => {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  });
  return sanitized;
};

const logActivity = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    res.on('finish', async () => {
      // Only log successful modification requests by authenticated users
      if (req.user && res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const action = req.logAction || `${req.method} ${req.baseUrl || req.path}`;
          const details = req.logDetails || {
            body: sanitizeBody(req.body),
            params: req.params,
            query: req.query
          };

          await ActivityLog.create({
            user: req.user._id,
            action,
            details,
            ipAddress: req.ip || req.connection.remoteAddress
          });
        } catch (err) {
          console.error('Activity log error:', err);
        }
      }
    });
  }
  next();
};

module.exports = { logActivity };
