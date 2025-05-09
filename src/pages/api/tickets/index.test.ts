import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import ticketsHandler from './index';
import { AuthenticatedRequest } from '@/shared/lib/auth';

// Mock the prisma client
jest.mock('@/shared/lib/prisma', () => {
  return {
    __esModule: true,
    default: {
      ticket: {
        findMany: jest.fn(),
      },
      seat: {
        findMany: jest.fn(),
      },
    },
  };
});

// Import prisma after mocking
import prisma from '@/shared/lib/prisma';

// Mock the auth middleware
jest.mock('@/shared/lib/auth', () => ({
  withAdminAuth: jest.fn((handler) => async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Mock the admin authentication
    req.user = { isAdmin: true, id: 1, username: 'admin' };
    return handler(req, res);
  }),
}));

describe('Tickets API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tickets', () => {
    const createdAt1 = new Date('2023-01-01T10:00:00Z');
    const createdAt2 = new Date('2023-01-01T11:00:00Z');
    
    const mockTickets = [
      {
        id: 1,
        customerName: 'John Doe',
        customerPhone: '1234567890',
        seatId: 1,
        createdAt: createdAt1,
        seat: {
          id: 1,
          row: 1,
          seat: 1,
          sessionId: 1,
          isReserved: true,
        },
      },
      {
        id: 2,
        customerName: 'Jane Smith',
        customerPhone: '0987654321',
        seatId: 2,
        createdAt: createdAt2,
        seat: {
          id: 2,
          row: 1,
          seat: 2,
          sessionId: 1,
          isReserved: true,
        },
      },
    ];

    it('should return all tickets', async () => {
      (prisma.ticket.findMany as jest.Mock).mockResolvedValue(mockTickets);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await ticketsHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(prisma.ticket.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.ticket.findMany).toHaveBeenCalledWith({
        include: { seat: true },
      });
      
      const responseData = res._getJSONData();
      expect(responseData).toHaveLength(2);
      expect(responseData[0]).toMatchObject({
        id: 1,
        customerName: 'John Doe',
        customerPhone: '1234567890',
        seatId: 1,
        row: 1,
        seat: 1,
        sessionId: 1,
      });
      expect(responseData[1]).toMatchObject({
        id: 2,
        customerName: 'Jane Smith',
        customerPhone: '0987654321',
        seatId: 2,
        row: 1,
        seat: 2,
        sessionId: 1,
      });
    });

    it('should filter tickets by sessionId', async () => {
      const mockSeatsWithTickets = [
        {
          id: 1,
          row: 1,
          seat: 1,
          sessionId: 1,
          isReserved: true,
          ticket: {
            id: 1,
            customerName: 'John Doe',
            customerPhone: '1234567890',
            seatId: 1,
            createdAt: createdAt1,
          },
        },
        {
          id: 2,
          row: 1,
          seat: 2,
          sessionId: 1,
          isReserved: true,
          ticket: {
            id: 2,
            customerName: 'Jane Smith',
            customerPhone: '0987654321',
            seatId: 2,
            createdAt: createdAt2,
          },
        },
      ];

      (prisma.seat.findMany as jest.Mock).mockResolvedValue(mockSeatsWithTickets);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { sessionId: '1' },
      });

      await ticketsHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(prisma.seat.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.seat.findMany).toHaveBeenCalledWith({
        where: {
          sessionId: 1,
          isReserved: true,
        },
        include: { ticket: true },
      });
      
      const responseData = res._getJSONData();
      expect(responseData).toHaveLength(2);
      expect(responseData[0]).toMatchObject({
        id: 1,
        customerName: 'John Doe',
        customerPhone: '1234567890',
        seatId: 1,
        row: 1,
        seat: 1,
      });
      expect(responseData[1]).toMatchObject({
        id: 2,
        customerName: 'Jane Smith',
        customerPhone: '0987654321',
        seatId: 2,
        row: 1,
        seat: 2,
      });
    });

    it('should return 400 for invalid sessionId', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { sessionId: 'invalid' },
      });

      await ticketsHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'Invalid session ID' });
      expect(prisma.seat.findMany).not.toHaveBeenCalled();
    });

    it('should handle errors when fetching tickets', async () => {
      (prisma.ticket.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await ticketsHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Failed to fetch tickets' });
    });
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await ticketsHandler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({ message: 'Method not allowed' });
  });
}); 