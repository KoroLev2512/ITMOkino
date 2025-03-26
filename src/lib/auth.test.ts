import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { generateToken, verifyToken, withAuth, withAdminAuth, AuthenticatedRequest } from './auth';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn(),
}));

jest.mock('./prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a JWT token with user data', () => {
      const user = { id: 1, username: 'testuser', isAdmin: false };
      const token = generateToken(user);

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

      const result = await verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when token verification fails', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = await verifyToken('invalid-token');

      expect(jwt.verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when user is not found', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({
        id: 999,
        username: 'nonexistent',
        isAdmin: false,
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await verifyToken('valid-token');

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(result).toBeNull();
    });
  });

  describe('withAuth', () => {
    it('should call the handler when authentication is successful', async () => {
      const mockUser = { id: 1, username: 'testuser', isAdmin: false };
      const mockHandler = jest.fn();
      const wrappedHandler = withAuth(mockHandler);

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      // Mock the verifyToken function
      jest.spyOn(require('./auth'), 'verifyToken').mockResolvedValue(mockUser);

      await wrappedHandler(req, res);

      expect(req.user).toEqual(mockUser);
      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should return 401 when no token is provided', async () => {
      const mockHandler = jest.fn();
      const wrappedHandler = withAuth(mockHandler);

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({ message: 'Authentication required' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', async () => {
      const mockHandler = jest.fn();
      const wrappedHandler = withAuth(mockHandler);

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      // Mock the verifyToken function to return null (invalid token)
      jest.spyOn(require('./auth'), 'verifyToken').mockResolvedValue(null);

      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({ message: 'Invalid or expired token' });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should handle server errors', async () => {
      const mockHandler = jest.fn();
      const wrappedHandler = withAuth(mockHandler);

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
        headers: {
          authorization: 'Bearer valid-token',
        },
      });

      // Mock the verifyToken function to throw an error
      jest.spyOn(require('./auth'), 'verifyToken').mockRejectedValue(new Error('Server error'));

      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Server error' });
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('withAdminAuth', () => {
    it('should call the handler when user is an admin', async () => {
      const mockAdminUser = { id: 1, username: 'admin', isAdmin: true };
      const mockHandler = jest.fn() as (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>;
      
      // Mock the withAuth function
      jest.spyOn(require('./auth'), 'withAuth').mockImplementation((handler) => {
        return async (req: AuthenticatedRequest, res: NextApiResponse) => {
          req.user = mockAdminUser;
          return handler(req, res);
        };
      });

      const wrappedHandler = withAdminAuth(mockHandler);

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(mockHandler).toHaveBeenCalledWith(req, res);
    });

    it('should return 403 when user is not an admin', async () => {
      const mockNonAdminUser = { id: 2, username: 'user', isAdmin: false };
      const mockHandler = jest.fn() as (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>;
      
      // Mock the withAuth function
      jest.spyOn(require('./auth'), 'withAuth').mockImplementation((handler) => {
        return async (req: AuthenticatedRequest, res: NextApiResponse) => {
          req.user = mockNonAdminUser;
          return handler(req, res);
        };
      });

      const wrappedHandler = withAdminAuth(mockHandler);

      const { req, res } = createMocks<AuthenticatedRequest, NextApiResponse>({
        method: 'GET',
      });

      await wrappedHandler(req, res);

      expect(res.statusCode).toBe(403);
      expect(res._getJSONData()).toEqual({ message: 'Admin access required' });
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
}); 