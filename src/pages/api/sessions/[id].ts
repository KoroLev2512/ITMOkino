import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/shared/lib/prisma';
import { withAdminAuth, AuthenticatedRequest } from '@/shared/lib/auth';

async function handler(req: NextApiRequest | AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const sessionId = parseInt(id as string);

  console.log(`API sessions/[id]: Handling ${req.method} request for session ID: ${sessionId}`);

  if (isNaN(sessionId)) {
    console.error(`API sessions/[id]: Invalid session ID: ${id}`);
    return res.status(400).json({ message: 'Invalid session ID' });
  }

  // GET - Public route to get a specific session with seats
  if (req.method === 'GET') {
    try {
      console.log(`API sessions/[id]: Fetching session with ID: ${sessionId}`);
      
      // Get the session with movie and seats
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          movie: true,
          seats: true
        }
      });

      if (!session) {
        console.error(`API sessions/[id]: Session not found with ID: ${sessionId}`);
        return res.status(404).json({ message: 'Session not found' });
      }

      // For each seat, check if it has a ticket
      const seatsWithStatus = await Promise.all(
        session.seats.map(async (seat) => {
          // Use raw query to check for ticket
          const tickets = await prisma.$queryRaw`
            SELECT id, "customerName", "customerPhone", "createdAt"
            FROM "Ticket" 
            WHERE "seatId" = ${seat.id}
            LIMIT 1
          `;
          
          const hasTicket = Array.isArray(tickets) && tickets.length > 0;
          const ticket = hasTicket ? tickets[0] : null;
          
          // Return seat with status
          return {
            id: seat.id,
            row: seat.row,
            seat: seat.seat,
            sessionId: seat.sessionId,
            isReserved: seat.isReserved || hasTicket,
            ticket: ticket
          };
        })
      );
      
      // Format the response
      const response = {
        id: session.id,
        time: session.time,
        movie: {
          id: session.movie.id,
          title: session.movie.title,
          image: session.movie.image,
          genre: session.movie.genre
        },
        seats: seatsWithStatus
      };

      console.log(`API sessions/[id]: Successfully fetched session: ${sessionId} with ${seatsWithStatus.length} seats`);
      return res.status(200).json(response);
    } catch (error) {
      console.error(`API sessions/[id]: Error fetching session ${sessionId}:`, error);
      return res.status(500).json({ message: 'Failed to fetch session' });
    }
  }

  // PUT - Admin route to update a session
  if (req.method === 'PUT') {
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

      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: {
          time,
          movieId: movieIdInt
        },
        include: { 
          movie: true,
          seats: true
        }
      });

      return res.status(200).json(updatedSession);
    } catch (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ message: 'Failed to update session' });
    }
  }

  // DELETE - Admin route to delete a session
  if (req.method === 'DELETE') {
    try {
      // First, check if session exists
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { seats: { include: { ticket: true } } }
      });

      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }

      // Delete tickets, then seats, then session
      for (const seat of session.seats) {
        if (seat.ticket) {
          await prisma.ticket.delete({ where: { id: seat.ticket.id } });
        }
      }
      
      await prisma.seat.deleteMany({ where: { sessionId } });
      await prisma.session.delete({ where: { id: sessionId } });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({ message: 'Failed to delete session' });
    }
  }

  // Method not allowed
  console.error(`API sessions/[id]: Method ${req.method} not allowed`);
  return res.status(405).json({ message: 'Method not allowed' });
}

// Public GET, Admin-only PUT and DELETE
export default async function apiHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handler(req, res);
  }
  
  return withAdminAuth(handler as any)(req as AuthenticatedRequest, res);
} 