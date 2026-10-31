const jwt = require('jsonwebtoken');
const { db, findOne } = require('../db/database');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await findOne(db.users, { id: decoded.id });
    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    if (user.status !== 'active') return res.status(403).json({ success: false, message: 'Account inactive.' });

    req.user = { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department, status: user.status };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: 'Invalid token.' });
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, message: 'Authentication error.' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: `Access denied. Required: ${roles.join(' or ')}.` });
    next();
  };
}

module.exports = { authenticate, authorize };
