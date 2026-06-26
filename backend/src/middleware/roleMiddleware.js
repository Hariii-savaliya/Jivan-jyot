const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required'
      });
    }

    // Super Admin and Admin always bypass role restriction checks
    if (req.user.role === 'Super Admin' || req.user.role === 'Admin') {
      return next();
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: Role '${req.user.role}' does not have permission to access this resource`
    });
  };
};

module.exports = { authorize };
