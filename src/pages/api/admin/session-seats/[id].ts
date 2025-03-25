import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { withAdminAuth, AuthenticatedRequest } from '../../../../lib/auth';

// This is an admin-only endpoint to get detailed seat information including customer data
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const sessionId = parseInt(id as string);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }
    
    // Get the session first to verify it exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { 
        movie: true,
        seats: {
          include: {
            ticket: true
          },
          orderBy: [
            { row: 'asc' },
            { seat: 'asc' }
          ]
        }
      }
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Format the response
    const response = {
      session: {
        id: session.id,
        time: session.time,
        movieId: session.movieId,
        movieTitle: session.movie.title
      },
      seats: session.seats.map((seat: any) => {
        // A seat is reserved if it has a ticket
        const hasTicket = seat.ticket !== null;
        
        return {
          id: seat.id,
          row: seat.row,
          seat: seat.seat,
          sessionId: seat.sessionId,
          isReserved: hasTicket, // Only reserved if it has a ticket
          hasTicket: hasTicket,
          customerName: seat.ticket?.customerName || '',
          customerPhone: seat.ticket?.customerPhone || '',
          ticketCreatedAt: seat.ticket?.createdAt || null
        };
      })
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching session seats:', error);
    return res.status(500).json({ message: 'Failed to fetch session seats data' });
  }
}

export default withAdminAuth(handler); 