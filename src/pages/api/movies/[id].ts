import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withAdminAuth, AuthenticatedRequest } from '../../../lib/auth';

async function handler(req: NextApiRequest | AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const movieId = parseInt(id as string);

  if (isNaN(movieId)) {
    return res.status(400).json({ message: 'Invalid movie ID' });
  }

  // GET - Public route to get a specific movie
  if (req.method === 'GET') {
    try {
      const movie = await prisma.movie.findUnique({
        where: { id: movieId },
        include: { sessions: true }
      });

      if (!movie) {
        return res.status(404).json({ message: 'Movie not found' });
      }

      return res.status(200).json(movie);
    } catch (error) {
      console.error('Error fetching movie:', error);
      return res.status(500).json({ message: 'Failed to fetch movie' });
    }
  }

  // PUT - Admin route to update a movie
  if (req.method === 'PUT') {
    try {
      const { image, title, genre, description, duration, premiere, year, actors } = req.body;

      if (!image || !title || !genre || !description || !duration || !premiere || !year || !actors) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const updatedMovie = await prisma.movie.update({
        where: { id: movieId },
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

      return res.status(200).json(updatedMovie);
    } catch (error) {
      console.error('Error updating movie:', error);
      return res.status(500).json({ message: 'Failed to update movie' });
    }
  }

  // DELETE - Admin route to delete a movie
  if (req.method === 'DELETE') {
    try {
      // First, delete all sessions and seats associated with the movie
      const sessions = await prisma.session.findMany({
        where: { movieId },
        include: { seats: { include: { ticket: true } } }
      });

      // Delete tickets, seats, and sessions
      for (const session of sessions) {
        for (const seat of session.seats) {
          if (seat.ticket) {
            await prisma.ticket.delete({ where: { id: seat.ticket.id } });
          }
          await prisma.seat.delete({ where: { id: seat.id } });
        }
        await prisma.session.delete({ where: { id: session.id } });
      }

      // Finally, delete the movie
      await prisma.movie.delete({ where: { id: movieId } });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting movie:', error);
      return res.status(500).json({ message: 'Failed to delete movie' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

// Public GET, Admin-only PUT and DELETE
export default async function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handler(req, res);
  }
  
  return withAdminAuth(handler as any)(req as AuthenticatedRequest, res);
} 