import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import sessionDetailHandler from './[id]';
import * as auth from '../../../lib/auth';
import { AuthenticatedRequest } from '../../../lib/auth';

jest.mock('../../../lib/prisma', () => ({
  session: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  movie: {
    findUnique: jest.fn(),
  },
  seat: {
    deleteMany: jest.fn(),
  },
  ticket: {
    delete: jest.fn(),
  },
  $queryRaw: jest.fn(),
}));

jest.mock('../../../lib/auth', () => ({
  withAdminAuth: jest.fn((handler) => (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Mock the admin authentication
    req.user = { isAdmin: true, id: 1, username: 'admin' };
    return handler(req, res);
  }),
}));

describe('Session Detail API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMovie = {
    id: 1,
    title: 'Test Movie',
    image: 'image1.jpg',
    genre: 'Action',
  };

  const mockSession = {
    id: 1,
    time: '10:00',
    movieId: 1,
    movie: mockMovie,
    seats: [
      { id: 1, row: 1, seat: 1, sessionId: 1, isReserved: false },
      { id: 2, row: 1, seat: 2, sessionId: 1, isReserved: true },
    ],
  };

  describe('GET /api/sessions/[id]', () => {
    it('should return a session by ID with seat status', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(mockSession);
      (prisma.$queryRaw as jest.Mock).mockImplementation((query) => {
        // Return ticket for seat ID 2, empty array for seat ID 1
        const seatId = query[1].value;
        if (seatId === 2) {
          return [{ id: 1, customerName: 'John Doe', customerPhone: '1234567890', createdAt: new Date() }];
        }
        return [];
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: '1' },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { movie: true, seats: true },
      });
      
      const responseData = res._getJSONData();
      expect(responseData).toHaveProperty('id', 1);
      expect(responseData).toHaveProperty('time', '10:00');
      expect(responseData).toHaveProperty('movie');
      expect(responseData).toHaveProperty('seats');
      expect(responseData.seats).toHaveLength(2);
      expect(responseData.seats[0].isReserved).toBe(false);
      expect(responseData.seats[1].isReserved).toBe(true);
    });

    it('should return 404 when session is not found', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: '999' },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Session not found' });
    });

    it('should return 400 for invalid session ID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: 'invalid' },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'Invalid session ID' });
    });

    it('should handle errors when fetching a session', async () => {
      (prisma.session.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: '1' },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Failed to fetch session' });
    });
  });

  describe('PUT /api/sessions/[id]', () => {
    it('should update a session with valid data', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);
      (prisma.session.update as jest.Mock).mockResolvedValue({
        ...mockSession,
        time: '14:00',
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: {
          time: '14:00',
          movieId: 1,
        },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          time: '14:00',
          movieId: 1,
        },
        include: { movie: true, seats: true },
      });
      expect(res._getJSONData()).toHaveProperty('time', '14:00');
    });

    it('should return 400 when required fields are missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: {
          // Missing time
          movieId: 1,
        },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'Time and movieId are required' });
      expect(prisma.session.update).not.toHaveBeenCalled();
    });

    it('should return 404 when movie does not exist', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: {
          time: '14:00',
          movieId: 999,
        },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Movie not found' });
      expect(prisma.session.update).not.toHaveBeenCalled();
    });

    it('should handle errors when updating a session', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);
      (prisma.session.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: {
          time: '14:00',
          movieId: 1,
        },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Failed to update session' });
    });
  });

  describe('DELETE /api/sessions/[id]', () => {
    it('should delete a session and its associations', async () => {
      const sessionWithTickets = {
        ...mockSession,
        seats: [
          { id: 1, ticket: { id: 1 } },
          { id: 2, ticket: null },
        ],
      };
      
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(sessionWithTickets);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: '1' },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(204);
      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { seats: { include: { ticket: true } } },
      });
      expect(prisma.ticket.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.seat.deleteMany).toHaveBeenCalledWith({ where: { sessionId: 1 } });
      expect(prisma.session.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 when session does not exist', async () => {
      (prisma.session.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: '999' },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Session not found' });
      expect(prisma.seat.deleteMany).not.toHaveBeenCalled();
      expect(prisma.session.delete).not.toHaveBeenCalled();
    });

    it('should handle errors when deleting a session', async () => {
      (prisma.session.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: '1' },
      });

      await sessionDetailHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Failed to delete session' });
    });
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PATCH',
      query: { id: '1' },
    });

    await sessionDetailHandler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({ message: 'Method not allowed' });
  });
}); 