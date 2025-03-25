import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

export const generateToken = (user: { id: number; username: string; isAdmin: boolean }) => {
  return jwt.sign(
    { id: user.id, username: user.username, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      isAdmin: boolean;
    };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return null;
    }
    
    return { id: user.id, username: user.username, isAdmin: user.isAdmin };
  } catch (error) {
    return null;
  }
};

export const withAuth = (handler: (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void>) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const user = await verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      req.user = user;
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  };
};

export const withAdminAuth = (handler: (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => Promise<void>) => {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    return handler(req, res);
  });
}; 