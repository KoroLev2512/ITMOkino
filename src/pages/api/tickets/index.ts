import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/shared/lib/prisma';
import { withAdminAuth, AuthenticatedRequest } from '@/shared/lib/auth';

async function handler(req: NextApiRequest | AuthenticatedRequest, res: NextApiResponse) {
  // GET - Admin-only route to get tickets (optionally filtered by sessionId)
  if (req.method === 'GET') {
    try {
      const { sessionId } = req.query;
      
      if (sessionId) {
        // Get tickets for a specific session
        const sessionIdInt = parseInt(sessionId as string);
        if (isNaN(sessionIdInt)) {
          return res.status(400).json({ message: 'Invalid session ID' });
        }
        
        // First get all seats for this session
        const seats = await prisma.seat.findMany({
          where: { 
            sessionId: sessionIdInt,
            isReserved: true
          },
          include: { ticket: true }
        });
        
        // Extract tickets from seats
        const tickets = seats
          .filter(seat => seat.ticket)
          .map(seat => ({
            id: seat.ticket!.id,
            customerName: seat.ticket!.customerName,
            customerPhone: seat.ticket!.customerPhone,
            seatId: seat.id,
            createdAt: seat.ticket!.createdAt,
            row: seat.row,
            seat: seat.seat
          }));
        
        return res.status(200).json(tickets);
      } else {
        // Get all tickets
        const tickets = await prisma.ticket.findMany({
          include: { seat: true }
        });
        
        // Transform data to include seat information
        const formattedTickets = tickets.map(ticket => ({
          id: ticket.id,
          customerName: ticket.customerName,
          customerPhone: ticket.customerPhone,
          seatId: ticket.seatId,
          createdAt: ticket.createdAt,
          row: ticket.seat.row,
          seat: ticket.seat.seat,
          sessionId: ticket.seat.sessionId
        }));
        
        return res.status(200).json(formattedTickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  }
  
  // POST is for creating tickets - handled separately
  
  return res.status(405).json({ message: 'Method not allowed' });
}

// Admin-only API
export default withAdminAuth(handler as any); 