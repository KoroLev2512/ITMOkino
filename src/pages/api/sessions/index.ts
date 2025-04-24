import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/shared/lib/prisma';
import { withAdminAuth, AuthenticatedRequest } from '@/shared/lib/auth';

async function handler(req: NextApiRequest | AuthenticatedRequest, res: NextApiResponse) {
  // GET - Public route to get all sessions or filter by movieId
  if (req.method === 'GET') {
    try {
      const { movieId } = req.query;
      let sessions;

      if (movieId) {
        const movieIdInt = parseInt(movieId as string);
        if (isNaN(movieIdInt)) {
          return res.status(400).json({ message: 'Invalid movie ID' });
        }

        sessions = await prisma.session.findMany({
          where: { movieId: movieIdInt },
          include: { movie: true, seats: true }
        });
      } else {
        sessions = await prisma.session.findMany({
          include: { movie: true, seats: true }
        });
      }

      return res.status(200).json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return res.status(500).json({ message: 'Failed to fetch sessions' });
    }
  }
  
  // POST - Admin route to create a session
  if (req.method === 'POST') {
    try {
      const { time, movieId } = req.body;
      
      if (!time || !movieId) {
        return res.status(400).json({ message: 'Time and movieId are required' });
      }

      const movieIdInt = parseInt(movieId);
      if (isNaN(movieIdInt)) {
        return res.status(400).json({ message: 'Invalid movie ID' });
      }

      // Check if movie exists
      const movie = await prisma.movie.findUnique({
        where: { id: movieIdInt }
      });

      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }

      const session = await prisma.session.create({
        data: {
          time,
          movieId: movieIdInt
        }
      });
      
      // Create default seats (5 rows with 10 seats each)
      const seatsToCreate = [];
      for (let row = 1; row <= 5; row++) {
        for (let seat = 1; seat <= 10; seat++) {
          seatsToCreate.push({
            sessionId: session.id,
            row,
            seat,
            isReserved: false
          });
        }
      }

      await prisma.seat.createMany({
        data: seatsToCreate
      });

      // Get the session with seats
      const sessionWithSeats = await prisma.session.findUnique({
        where: { id: session.id },
        include: { seats: true }
      });
      
      return res.status(201).json(sessionWithSeats);
    } catch (error) {
      console.error('Error creating session:', error);
      return res.status(500).json({ message: 'Failed to create session' });
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