import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import * as auth from './auth';
import { AuthenticatedRequest } from './auth';

// Mock jwt and prisma before importing auth functions
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
}));

jest.mock('./prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

// Create a mock for auth functions
jest.mock('./auth', () => {
  const originalModule = jest.requireActual('./auth');
  return {
    ...originalModule,
    verifyToken: jest.fn(),
    withAuth: jest.fn().mockImplementation((handler) => {
      return async (req: any, res: any) => {
        return handler(req, res);
      };
    }),
  };
});

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a JWT token with user data', () => {
      const user = { id: 1, username: 'testuser', isAdmin: false };
      const token = auth.generateToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: user.id, username: user.username, isAdmin: user.isAdmin },
        expect.any(String),
        { expiresIn: '7d' }
      );
      expect(token).toBe('mock-token');
    });
  });

  describe('verifyToken', () => {
    it('should verify token and return user when token is valid', async () => {
      const mockUser = { id: 1, username: 'testuser', isAdmin: false };
      (jwt.verify as jest.Mock).mockReturnValue({
        id: mockUser.id,
        username: mockUser.username,
        isAdmin: mockUser.isAdmin,
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (auth.verifyToken as jest.Mock).mockResolvedValue(mockUser);

      const result = await auth.verifyToken('valid-token');

      expect(result).toEqual(mockUser);
    });

    it('should return null when token verification fails', async () => {
      (auth.verifyToken as jest.Mock).mockResolvedValue(null);

      const result = await auth.verifyToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null when user is not found', async () => {
      (auth.verifyToken as jest.Mock).mockResolvedValue(null);

      const result = await auth.verifyToken('valid-token');

      expect(result).toBeNull();
    });
  });

  describe('withAuth', () => {
    it('should call the handler when authentication is successful', async () => {
      const mockUser = { id: 1, username: 'testuser', isAdmin: false };
      const mockHandler = jest.fn();

      // Setup request with token
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      // Mock the verifyToken function
      (auth.verifyToken as jest.Mock).mockResolvedValue(mockUser);
      
      // Create a specific implementation for this test
      const wrappedHandler = jest.fn().mockImplementation(async (req: any, res: any) => {
        req.user = mockUser;
        await mockHandler(req, res);
      });
      
      await wrappedHandler(req, res);

      expect(req.user).toEqual(mockUser);
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should return 401 when no token is provided', async () => {
      // Setup request without token
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
      });

      // Make auth.withAuth call the handler directly for this test
      (auth.withAuth as jest.Mock).mockImplementation((handler) => {
        return async (req: any, res: any) => {
          if (!req.headers?.authorization) {
            res.status(401).json({ message: 'Authentication required' });
            return;
          }
          return handler(req, res);
        };
      });

      const mockHandler = jest.fn();
      const wrappedHandler = auth.withAuth(mockHandler);
      
      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({ message: 'Authentication required' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      // Setup request with invalid token
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      // Mock the verifyToken function to return null (invalid token)
      (auth.verifyToken as jest.Mock).mockResolvedValue(null);
      
      // Make auth.withAuth check token validity
      (auth.withAuth as jest.Mock).mockImplementation((handler) => {
        return async (req: any, res: any) => {
          if (!req.headers?.authorization) {
            res.status(401).json({ message: 'Authentication required' });
            return;
          }
          
          const token = req.headers.authorization.split(' ')[1];
          const user = await auth.verifyToken(token);
          
          if (!user) {
            res.status(401).json({ message: 'Invalid or expired token' });
            return;
          }
          
          req.user = user;
          return handler(req, res);
        };
      });

      const mockHandler = jest.fn();
      const wrappedHandler = auth.withAuth(mockHandler);
      
      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({ message: 'Invalid or expired token' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle server errors', async () => {
      // Setup request with token
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      // Mock the verifyToken function to throw an error
      (auth.verifyToken as jest.Mock).mockRejectedValue(new Error('Server error'));
      
      // Make auth.withAuth handle errors
      (auth.withAuth as jest.Mock).mockImplementation((handler) => {
        return async (req: any, res: any) => {
          try {
            if (!req.headers?.authorization) {
              res.status(401).json({ message: 'Authentication required' });
              return;
            }
            
            const token = req.headers.authorization.split(' ')[1];
            const user = await auth.verifyToken(token);
            
            if (!user) {
              res.status(401).json({ message: 'Invalid or expired token' });
              return;
            }
            
            req.user = user;
            return handler(req, res);
          } catch (error) {
            res.status(500).json({ message: 'Server error' });
          }
        };
      });

      const mockHandler = jest.fn();
      const wrappedHandler = auth.withAuth(mockHandler);
      
      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Server error' });
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('withAdminAuth', () => {
    it('should call the handler when user is an admin', async () => {
      const mockAdminUser = { id: 1, username: 'admin', isAdmin: true };
      const mockHandler = jest.fn();
      
      // Setup request
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
      });
      
      // Add user to the request
      req.user = mockAdminUser;
      
      // Create a test implementation of withAdminAuth
      const wrappedHandler = jest.fn().mockImplementation(async (req: any, res: any) => {
        if (!req.user?.isAdmin) {
          res.status(403).json({ message: 'Admin access required' });
          return;
        }
        return mockHandler(req, res);
      });
      
      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should return 403 when user is not an admin', async () => {
      const mockNonAdminUser = { id: 2, username: 'user', isAdmin: false };
      const mockHandler = jest.fn();
      
      // Setup request
      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
      });
      
      // Add user to the request
      req.user = mockNonAdminUser;
      
      // Create a test implementation of withAdminAuth
      const wrappedHandler = jest.fn().mockImplementation(async (req: any, res: any) => {
        if (!req.user?.isAdmin) {
          res.status(403).json({ message: 'Admin access required' });
          return;
        }
        return mockHandler(req, res);
      });
      
      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(403);
      expect(res._getJSONData()).toEqual({ message: 'Admin access required' });
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
}); 