import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withAdminAuth, AuthenticatedRequest } from '../../../lib/auth';

async function handler(req: NextApiRequest | AuthenticatedRequest, res: NextApiResponse) {
  // GET - Public route to get all movies
  if (req.method === 'GET') {
    try {
      const movies = await prisma.movie.findMany({
        include: { sessions: true }
      });
      return res.status(200).json(movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      return res.status(500).json({ message: 'Failed to fetch movies' });
    }
  }
  
  // POST - Admin route to create a movie
  if (req.method === 'POST') {
    try {
      const { image, title, genre, description, duration, premiere, year, actors } = req.body;
      
      if (!image || !title || !genre || !description || !duration || !premiere || !year || !actors) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const movie = await prisma.movie.create({
        data: {
          image,
          title,
          genre,
          description,
          duration: parseInt(duration),
          premiere: new Date(premiere),
          year: parseInt(year),
          actors: JSON.stringify(actors),
        }
      });
      
      return res.status(201).json(movie);
    } catch (error) {
      console.error('Error creating movie:', error);
      return res.status(500).json({ message: 'Failed to create movie' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}

// Public GET, Admin-only POST
export default async function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handler(req, res);
  }
  
  return withAdminAuth(handler as any)(req as AuthenticatedRequest, res);
} 