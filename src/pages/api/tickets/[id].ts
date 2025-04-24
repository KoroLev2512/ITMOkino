import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/shared/lib/prisma';
import { withAdminAuth, AuthenticatedRequest } from '@/shared/lib/auth';

async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;
  const ticketId = parseInt(id as string);

  if (isNaN(ticketId)) {
    res.status(400).json({ message: 'Invalid ticket ID' });
    return;
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
        res.status(404).json({ message: 'Ticket not found' });
        return;
      }

      res.status(200).json(ticket);
      return;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      res.status(500).json({ message: 'Failed to fetch ticket' });
      return;
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
        res.status(404).json({ message: 'Ticket not found' });
        return;
      }

      // Update the seat to not be reserved
      await prisma.seat.update({
        where: { id: ticket.seat.id },
        data: { isReserved: false }
      });

      // Delete the ticket
      await prisma.ticket.delete({ where: { id: ticketId } });

      res.status(204).end();
      return;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      res.status(500).json({ message: 'Failed to delete ticket' });
      return;
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}

// Admin-only endpoint
export default withAdminAuth(handler); 