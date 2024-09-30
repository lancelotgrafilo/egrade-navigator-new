const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If there's no token, return 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Verify the token using the secret key
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // If the token is invalid or expired, return 403 (Forbidden)
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    // Attach the decoded user information to the request object
    req.user = decoded;
    
    // Proceed to the next middleware or route handler
    next();
  });
};

module.exports = authenticateToken;
