import { createMocks } from 'node-mocks-http';
import apiHandler from './index';
import prisma from '../../../lib/prisma';

// Mock Prisma client
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Movies API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all movies', async () => {
    const mockMovies = [
      {
        id: 1,
        image: '/images/movie1.jpg',
        title: 'Test Movie',
        genre: 'Action',
        description: 'Test description',
        duration: 120,
        premiere: new Date('2023-01-01'),
        year: 2023,
        actors: '["Actor 1", "Actor 2"]',
        sessions: [],
      },
    ];

    (prisma.movie.findMany as jest.Mock).mockResolvedValue(mockMovies);

    const { req, res } = createMocks({
      method: 'GET',
    });

    await apiHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockMovies);
    expect(prisma.movie.findMany).toHaveBeenCalledWith({
      include: { sessions: true },
    });
  });

  // Add more tests as needed
}); 