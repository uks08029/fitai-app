import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fitai_jwt_secret_super_secure_key_2026_fitness_ai';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid authentication token. Please log in again.',
    });
  }
};

export default protect;
