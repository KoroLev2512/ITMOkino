import { NextApiRequest, NextApiResponse } from 'next';
import apiHandler from './index';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../../../lib/auth';

// Mock prisma
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    movie: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock auth middleware
jest.mock('../../../lib/auth', () => ({
  withAdminAuth: jest.fn((handler) => handler),
  AuthenticatedRequest: {},
}));

describe('Movies API', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  
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
  
  describe('GET /api/movies', () => {
    it('should return all movies', async () => {
      // Mock data
      const mockMovies = [
        {
          id: 1,
          title: 'Test Movie 1',
          description: 'Test Description 1',
          genre: 'Action',
          duration: 120,
          image: 'test1.jpg',
          premiere: new Date('2023-01-01'),
          year: 2023,
          actors: ['Actor 1', 'Actor 2'],
          sessions: [],
        },
        {
          id: 2,
          title: 'Test Movie 2',
          description: 'Test Description 2',
          genre: 'Comedy',
          duration: 90,
          image: 'test2.jpg',
          premiere: new Date('2023-01-02'),
          year: 2023,
          actors: ['Actor 3', 'Actor 4'],
          sessions: [],
        },
      ];
      
      // Setup request
      req.method = 'GET';
      
      // Mock prisma response
      const prisma = require('../../../lib/prisma').default;
      prisma.movie.findMany.mockResolvedValue(mockMovies);
      
      // Call the handler
      await apiHandler(req as NextApiRequest, res as NextApiResponse);
      
      // Assertions
      expect(prisma.movie.findMany).toHaveBeenCalledWith({
        include: { sessions: true }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMovies);
    });
    
    it('should handle errors when fetching movies', async () => {
      // Setup request
      req.method = 'GET';
      
      // Mock prisma error
      const prisma = require('../../../lib/prisma').default;
      prisma.movie.findMany.mockRejectedValue(new Error('Database error'));
      
      // Call the handler
      await apiHandler(req as NextApiRequest, res as NextApiResponse);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch movies' });
    });
  });
  
  describe('POST /api/movies', () => {
    it('should create a new movie', async () => {
      // Mock data
      const newMovie = {
        title: 'New Movie',
        description: 'New Description',
        genre: 'Drama',
        duration: '110',
        image: 'new.jpg',
        premiere: '2023-01-03',
        year: '2023',
        actors: ['Actor 5', 'Actor 6'],
      };
      
      const createdMovie = {
        id: 3,
        ...newMovie,
        duration: 110,
        premiere: new Date('2023-01-03'),
        year: 2023,
        actors: JSON.stringify(['Actor 5', 'Actor 6']),
      };
      
      // Setup request as authenticated admin
      req.method = 'POST';
      req.body = newMovie;
      (req as AuthenticatedRequest).user = {
        id: 1,
        username: 'admin',
        isAdmin: true,
      };
      
      // Mock prisma response
      const prisma = require('../../../lib/prisma').default;
      prisma.movie.create.mockResolvedValue(createdMovie);
      
      // Call the handler
      await apiHandler(req as NextApiRequest, res as NextApiResponse);
      
      // Assertions
      expect(prisma.movie.create).toHaveBeenCalledWith({
        data: {
          title: 'New Movie',
          description: 'New Description',
          genre: 'Drama',
          duration: 110,
          image: 'new.jpg',
          premiere: expect.any(Date),
          year: 2023,
          actors: JSON.stringify(['Actor 5', 'Actor 6']),
        }
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdMovie);
    });
    
    it('should return 400 if required fields are missing', async () => {
      // Setup request with missing fields
      req.method = 'POST';
      req.body = {
        title: 'Incomplete Movie',
        // Missing other required fields
      };
      (req as AuthenticatedRequest).user = {
        id: 1,
        username: 'admin',
        isAdmin: true,
      };
      
      // Call the handler
      await apiHandler(req as NextApiRequest, res as NextApiResponse);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
      expect(require('../../../lib/prisma').default.movie.create).not.toHaveBeenCalled();
    });
    
    it('should handle errors when creating a movie', async () => {
      // Setup request
      req.method = 'POST';
      req.body = {
        title: 'Error Movie',
        description: 'Error Description',
        genre: 'Thriller',
        duration: '120',
        image: 'error.jpg',
        premiere: '2023-01-04',
        year: '2023',
        actors: ['Actor 7', 'Actor 8'],
      };
      (req as AuthenticatedRequest).user = {
        id: 1,
        username: 'admin',
        isAdmin: true,
      };
      
      // Mock prisma error
      const prisma = require('../../../lib/prisma').default;
      prisma.movie.create.mockRejectedValue(new Error('Database error'));
      
      // Call the handler
      await apiHandler(req as NextApiRequest, res as NextApiResponse);
      
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create movie' });
    });
  });
  
  it('should return 405 for unsupported methods', async () => {
    // Setup request with unsupported method
    req.method = 'PUT';
    
    // Call the handler
    await apiHandler(req as NextApiRequest, res as NextApiResponse);
    
    // Assertions
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
  });
}); 