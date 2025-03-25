import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { withAdminAuth, AuthenticatedRequest } from '../../../lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;
  const ticketId = parseInt(id as string);

  if (isNaN(ticketId)) {
    return res.status(400).json({ message: 'Invalid ticket ID' });
  }

  // GET - Admin route to get a specific ticket
  if (req.method === 'GET') {
    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          seat: {
            include: {
              session: {
                include: {
                  movie: true
                }
              }
            }
          }
        }
      });

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      return res.status(200).json(ticket);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return res.status(500).json({ message: 'Failed to fetch ticket' });
    }
  }

  // DELETE - Admin route to delete a ticket
  if (req.method === 'DELETE') {
    try {
      // First, check if ticket exists
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { seat: true }
      });

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      // Update the seat to not be reserved
      await prisma.seat.update({
        where: { id: ticket.seat.id },
        data: { isReserved: false }
      });

      // Delete the ticket
      await prisma.ticket.delete({ where: { id: ticketId } });

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return res.status(500).json({ message: 'Failed to delete ticket' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

// Admin-only endpoint
export default withAdminAuth(handler); 