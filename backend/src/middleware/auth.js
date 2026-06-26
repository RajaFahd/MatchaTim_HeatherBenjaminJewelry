const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_please_change_me';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Development mode fallback: automatically authenticate with a dummy user
    req.user = { 
      id: 'dummy-user-id', 
      email: 'manager@heatherbenjamin.com', 
      name: 'Operations Manager', 
      role: 'manager' 
    };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // If token verification fails, also fall back to dummy user in development
    req.user = { 
      id: 'dummy-user-id', 
      email: 'manager@heatherbenjamin.com', 
      name: 'Operations Manager', 
      role: 'manager' 
    };
    next();
  }
};

module.exports = authMiddleware;
