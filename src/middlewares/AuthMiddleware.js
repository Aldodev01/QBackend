import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


const AuthMiddleware = {
  authMiddleware: (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }
  
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.userId = payload.userId;
      req.userStatus = payload.status;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      next(error);
    }
  },
  requireSigner: (req, res, next) => {
    if (!req.userStatus) {
      res.status(401).json({ error: 'User status is required' });
      return next(error);
    }
  
    if (req.userStatus !== 'signer') {
      res.status(403).json({ code: 403, error: 'Access denied. Only signers can perform this action.' });
      return next(error);
    }
  
    next();
  },
}
export default AuthMiddleware
