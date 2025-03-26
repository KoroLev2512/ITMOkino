import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    console.log('Debug Auth - Authorization header:', authHeader);
    
    if (!authHeader) {
      return res.status(200).json({ 
        status: 'error',
        error: 'No authorization header provided',
        headers: req.headers
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    console.log('Debug Auth - Token extracted:', token);
    
    if (!token) {
      return res.status(200).json({ 
        status: 'error',
        error: 'No token found in authorization header',
        authHeader
      });
    }
    
    // Get the JWT secret
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    console.log('Debug Auth - JWT_SECRET exists:', !!JWT_SECRET);
    
    // Attempt to verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Debug Auth - Token verification succeeded:', decoded);
      
      // Try verifying with our helper function too
      const user = await verifyToken(token);
      console.log('Debug Auth - User from verifyToken:', user);
      
      return res.status(200).json({
        status: 'success',
        decodedToken: decoded,
        user
      });
    } catch (verifyError) {
      console.error('Debug Auth - Token verification failed:', verifyError);
      return res.status(200).json({
        status: 'error',
        error: 'Token verification failed',
        details: verifyError.message
      });
    }
  } catch (error) {
    console.error('Debug Auth - Unexpected error:', error);
    return res.status(200).json({
      status: 'error',
      error: 'Unexpected error',
      details: error.message
    });
  }
} 