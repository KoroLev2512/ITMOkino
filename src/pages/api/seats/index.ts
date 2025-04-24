import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/shared/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`API seats: Handling ${req.method} request`);
  
  // GET - List available seats for a session
  if (req.method === 'GET') {
    try {
      const { sessionId } = req.query;
      
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }
      
      const seats = await prisma.seat.findMany({
        where: {
          sessionId: Number(sessionId),
          isReserved: false
        }
      });
      
      return res.status(200).json(seats);
    } catch (error) {
      console.error('API seats: Error fetching seats:', error);
      return res.status(500).json({ message: 'Failed to fetch seats', error: String(error) });
    }
  }
  
  // POST - Create a new seat
  if (req.method === 'POST') {
    try {
      const { sessionId, row, seat } = req.body;
      console.log('API seats: Creating new seat with data:', { sessionId, row, seat });
      
      if (!sessionId || row === undefined || seat === undefined) {
        console.error('API seats: Missing required fields:', { sessionId, row, seat });
        return res.status(400).json({ message: 'Session ID, row, and seat numbers are required' });
      }
      
      // Validate that the session exists
      const session = await prisma.session.findUnique({
        where: { id: Number(sessionId) }
      });
      
      if (!session) {
        console.error(`API seats: Session not found with ID: ${sessionId}`);
        return res.status(404).json({ message: 'Session not found' });
      }
      
      // Check if this seat already exists
      const existingSeat = await prisma.seat.findFirst({
        where: {
          sessionId: Number(sessionId),
          row: Number(row),
          seat: Number(seat)
        }
      });
      
      if (existingSeat) {
        console.log('API seats: Seat already exists:', existingSeat);
        
        // Check if the seat is already reserved or has a ticket
        const ticketResult = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM "Ticket" WHERE "seatId" = ${existingSeat.id}
        `;
        // Safely convert count to number
        const ticketCount = Array.isArray(ticketResult) && ticketResult.length > 0 
          ? Number(ticketResult[0].count) 
          : 0;
        
        // If the seat is reserved or has a ticket, return an error
        if (existingSeat.isReserved || ticketCount > 0) {
          console.log(`API seats: Seat ${existingSeat.id} is already reserved`);
          return res.status(400).json({ 
            message: `This seat (Row: ${row}, Seat: ${seat}) is already reserved` 
          });
        }
        
        // If the seat exists but is not reserved, return it
        console.log(`API seats: Returning existing available seat with ID: ${existingSeat.id}`);
        return res.status(200).json(existingSeat);
      }
      
      // Create the new seat
      const newSeat = await prisma.seat.create({
        data: {
          sessionId: Number(sessionId),
          row: Number(row),
          seat: Number(seat),
          isReserved: false
        }
      });
      
      console.log('API seats: Created new seat:', newSeat);
      return res.status(201).json(newSeat);
    } catch (error) {
      console.error('API seats: Error creating seat:', error);
      return res.status(500).json({ message: 'Failed to create seat', error: String(error) });
    }
  }
  
  // Method not allowed
  console.error(`API seats: Method ${req.method} not allowed`);
  return res.status(405).json({ message: `Method ${req.method} not allowed` });
} 