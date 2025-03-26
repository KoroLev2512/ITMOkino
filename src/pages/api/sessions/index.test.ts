import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import sessionHandler from './index';
import * as auth from '../../../lib/auth';
import { AuthenticatedRequest } from '../../../lib/auth';

jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    session: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    movie: {
      findUnique: jest.fn(),
    },
    seat: {
      createMany: jest.fn(),
    },
  },
}));

jest.mock('../../../lib/auth', () => ({
  withAdminAuth: jest.fn((handler) => handler),
  verifyToken: jest.fn(),
  AuthenticatedRequest: {},
}));

describe('Sessions API', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  const adminUser = { 
    id: 1, 
    username: 'admin', 
    isAdmin: true 
  };
  
  beforeEach(() => {
    req = {
      method: '',
      body: {},
      query: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    jest.clearAllMocks();
  });
  
  describe('GET /api/sessions', () => {
    const mockSessions = [
      {
        id: 1,
        time: '10:00',
        movieId: 1,
        movie: { title: 'Test Movie 1' },
        seats: [],
      },
      {
        id: 2,
        time: '14:00',
        movieId: 2,
        movie: { title: 'Test Movie 2' },
        seats: [],
      },
    ];

    it('should return all sessions', async () => {
      (prisma.session.findMany as jest.Mock).mockResolvedValue(mockSessions);

      req.method = 'GET';

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(prisma.session.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.session.findMany).toHaveBeenCalledWith({
        include: { movie: true, seats: true },
      });
      expect(res.json).toHaveBeenCalledWith(mockSessions);
    });

    it('should filter sessions by movieId', async () => {
      const filteredSessions = [mockSessions[0]];
      (prisma.session.findMany as jest.Mock).mockResolvedValue(filteredSessions);

      req.method = 'GET';
      req.query = { movieId: '1' };

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(prisma.session.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.session.findMany).toHaveBeenCalledWith({
        where: { movieId: 1 },
        include: { movie: true, seats: true },
      });
      expect(res.json).toHaveBeenCalledWith(filteredSessions);
    });

    it('should return 400 for invalid movieId', async () => {
      req.method = 'GET';
      req.query = { movieId: 'invalid' };

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid movie ID' });
      expect(prisma.session.findMany).not.toHaveBeenCalled();
    });

    it('should handle errors when fetching sessions', async () => {
      (prisma.session.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      req.method = 'GET';

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch sessions' });
    });
  });

  describe('POST /api/sessions', () => {
    const mockMovie = {
      id: 1,
      title: 'Test Movie',
    };

    const mockSession = {
      id: 1,
      time: '10:00',
      movieId: 1,
    };

    const mockSessionWithSeats = {
      ...mockSession,
      seats: Array(50).fill(null).map((_, i) => ({
        id: i + 1,
        sessionId: 1,
        row: Math.floor(i / 10) + 1,
        seat: (i % 10) + 1,
        isReserved: false,
      })),
    };

    it('should create a new session with valid data', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);
      (prisma.session.create as jest.Mock).mockResolvedValue(mockSession);
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSessionWithSeats);

      req.method = 'POST';
      req.body = {
        time: '10:00',
        movieId: 1,
      };

      // Mock auth for admin endpoint
      (req as AuthenticatedRequest).user = { 
        id: 1, 
        username: 'admin', 
        isAdmin: true 
      };

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.session.create).toHaveBeenCalledWith({
        data: {
          time: '10:00',
          movieId: 1,
        },
      });
      expect(prisma.seat.createMany).toHaveBeenCalled();
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { seats: true },
      });
      expect(res.json).toHaveBeenCalledWith(mockSessionWithSeats);
    });

    it('should return 400 when required fields are missing', async () => {
      req.method = 'POST';
      req.body = {
        // Missing time
        movieId: 1,
      };

      // Mock auth for admin endpoint
      (req as AuthenticatedRequest).user = { 
        id: 1, 
        username: 'admin', 
        isAdmin: true 
      };

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Time and movieId are required' });
      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid movieId', async () => {
      req.method = 'POST';
      req.body = {
        time: '10:00',
        movieId: 'invalid',
      };

      // Mock auth for admin endpoint
      (req as AuthenticatedRequest).user = { 
        id: 1, 
        username: 'admin', 
        isAdmin: true 
      };

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid movie ID' });
      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('should return 404 when movie does not exist', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      req.method = 'POST';
      req.body = {
        time: '10:00',
        movieId: 999,
      };

      // Mock auth for admin endpoint
      (req as AuthenticatedRequest).user = { 
        id: 1, 
        username: 'admin', 
        isAdmin: true 
      };

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Movie not found' });
      expect(prisma.session.create).not.toHaveBeenCalled();
    });

    it('should handle errors when creating a session', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);
      (prisma.session.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      req.method = 'POST';
      req.body = {
        time: '10:00',
        movieId: 1,
      };

      // Mock auth for admin endpoint
      (req as AuthenticatedRequest).user = { 
        id: 1, 
        username: 'admin', 
        isAdmin: true 
      };

      await sessionHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create session' });
    });
  });

  it('should return 405 for unsupported methods', async () => {
    req.method = 'PUT';

    await sessionHandler(req as NextApiRequest, res as NextApiResponse);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
}); 