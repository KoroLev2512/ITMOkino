import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/shared/lib/prisma';
import movieDetailHandler from './[id]';
import * as auth from '@/shared/lib/auth';
import { AuthenticatedRequest } from '@/shared/lib/auth';

jest.mock('@/shared/lib/prisma', () => ({
  movie: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  session: {
    findMany: jest.fn(),
    delete: jest.fn(),
  },
  seat: {
    delete: jest.fn(),
  },
  ticket: {
    delete: jest.fn(),
  },
}));

jest.mock('@/shared/lib/auth', () => ({
  withAdminAuth: jest.fn((handler) => (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Mock the admin authentication
    req.user = { isAdmin: true, id: 1, username: 'admin' };
    return handler(req, res);
  }),
}));

describe('Movie Detail API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMovie = {
    id: 1,
    image: 'image1.jpg',
    title: 'Test Movie',
    genre: 'Action',
    description: 'Test description',
    duration: 120,
    premiere: new Date('2023-01-01'),
    year: 2023,
    actors: JSON.stringify(['Actor 1', 'Actor 2']),
    sessions: [],
  };

  describe('GET /api/movies/[id]', () => {
    it('should return a movie by ID', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(mockMovie);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: '1' },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(prisma.movie.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { sessions: true },
      });
      expect(res._getJSONData()).toMatchObject({
        id: mockMovie.id,
        title: mockMovie.title,
        description: mockMovie.description,
        genre: mockMovie.genre,
        duration: mockMovie.duration,
        image: mockMovie.image,
        year: mockMovie.year,
        sessions: mockMovie.sessions
      });
    });

    it('should return 404 when movie is not found', async () => {
      (prisma.movie.findUnique as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: '999' },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ message: 'Movie not found' });
    });

    it('should return 400 for invalid movie ID', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: 'invalid' },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'Invalid movie ID' });
    });

    it('should handle errors when fetching a movie', async () => {
      (prisma.movie.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { id: '1' },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Failed to fetch movie' });
    });
  });

  describe('PUT /api/movies/[id]', () => {
    it('should update a movie with valid data', async () => {
      const updatedMovie = {
        ...mockMovie,
        title: 'Updated Movie Title',
      };

      (prisma.movie.update as jest.Mock).mockResolvedValue(updatedMovie);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: {
          image: mockMovie.image,
          title: 'Updated Movie Title',
          genre: mockMovie.genre,
          description: mockMovie.description,
          duration: mockMovie.duration.toString(),
          premiere: mockMovie.premiere.toISOString(),
          year: mockMovie.year.toString(),
          actors: JSON.parse(mockMovie.actors),
        },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(prisma.movie.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          image: mockMovie.image,
          title: 'Updated Movie Title',
          genre: mockMovie.genre,
          description: mockMovie.description,
          duration: mockMovie.duration,
          premiere: expect.any(Date),
          year: mockMovie.year,
          actors: mockMovie.actors,
        },
      });
      expect(res._getJSONData()).toMatchObject({
        id: updatedMovie.id,
        title: updatedMovie.title,
        description: updatedMovie.description,
        genre: updatedMovie.genre,
        duration: updatedMovie.duration,
        image: updatedMovie.image,
        year: updatedMovie.year,
        sessions: updatedMovie.sessions
      });
    });

    it('should return 400 when required fields are missing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: {
          title: 'Updated Movie Title',
          // Missing other required fields
        },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ message: 'All fields are required' });
      expect(prisma.movie.update).not.toHaveBeenCalled();
    });

    it('should handle errors when updating a movie', async () => {
      (prisma.movie.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: {
          image: mockMovie.image,
          title: 'Updated Movie Title',
          genre: mockMovie.genre,
          description: mockMovie.description,
          duration: mockMovie.duration.toString(),
          premiere: mockMovie.premiere.toISOString(),
          year: mockMovie.year.toString(),
          actors: JSON.parse(mockMovie.actors),
        },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Failed to update movie' });
    });
  });

  describe('DELETE /api/movies/[id]', () => {
    const mockSessions = [
      {
        id: 1,
        movieId: 1,
        seats: [
          { id: 1, ticket: { id: 1 } },
          { id: 2, ticket: null },
        ],
      },
    ];

    it('should delete a movie and its associations', async () => {
      (prisma.session.findMany as jest.Mock).mockResolvedValue(mockSessions);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: '1' },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(204);
      expect(prisma.session.findMany).toHaveBeenCalledWith({
        where: { movieId: 1 },
        include: { seats: { include: { ticket: true } } },
      });
      expect(prisma.ticket.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.seat.delete).toHaveBeenCalledTimes(2);
      expect(prisma.session.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.movie.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should handle errors when deleting a movie', async () => {
      (prisma.session.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: '1' },
      });

      await movieDetailHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Failed to delete movie' });
    });
  });

  it('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'PATCH',
      query: { id: '1' },
    });

    await movieDetailHandler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({ message: 'Method not allowed' });
  });
}); 