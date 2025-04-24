import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/shared/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const seatId = parseInt(id as string);

  console.log(`API seats/[id]: Handling ${req.method} request for seat ID: ${seatId}`);

  if (isNaN(seatId)) {
    console.error(`API seats/[id]: Invalid seat ID: ${id}`);
    return res.status(400).json({ message: 'Invalid seat ID' });
  }

  // GET - Public route to get a specific seat
  if (req.method === 'GET') {
    try {
      console.log(`API seats/[id]: Fetching seat with ID: ${seatId}`);
      
      const seat = await prisma.seat.findUnique({
        where: { id: seatId },
        include: {
          ticket: true
        }
      });

      if (!seat) {
        console.error(`API seats/[id]: Seat not found with ID: ${seatId}`);
        return res.status(404).json({ message: 'Seat not found' });
      }

      return res.status(200).json(seat);
    } catch (error: any) {
      console.error('Error getting seat:', error);
      return res.status(500).json({ message: 'Error getting seat', error: error.message });
    }
  }

  // PUT - Public route to reserve a seat
  if (req.method === 'PUT') {
    try {
      console.log(`API seats/[id]: Attempting to reserve seat ID: ${seatId}`);
      console.log('Request body:', req.body);
      
      const { customerName, customerPhone } = req.body;
      
      if (!customerName || !customerPhone) {
        console.error(`API seats/[id]: Missing customer data for seat ${seatId}:`, req.body);
        return res.status(400).json({ message: 'Customer name and phone are required' });
      }
      
      // Check if seat exists
      const seat = await prisma.seat.findUnique({
        where: { id: seatId },
        include: { ticket: true }
      });
      
      if (!seat) {
        console.error(`API seats/[id]: Seat not found with ID: ${seatId}`);
        return res.status(404).json({ message: 'Seat not found' });
      }
      
      // Check if seat is already reserved
      if (seat.isReserved || seat.ticket) {
        console.error(`API seats/[id]: Seat ${seatId} is already reserved`);
        return res.status(400).json({ message: 'This seat is already reserved' });
      }
      
      console.log(`API seats/[id]: Creating ticket for seat: ${seatId}`);
      
      // Update the seat to mark it as reserved
      const updatedSeat = await prisma.seat.update({
        where: { id: seatId },
        data: {
          isReserved: true,
          ticket: {
            create: {
              customerName: customerName,
              customerPhone: customerPhone
            }
          }
        },
        include: { ticket: true }
      });
      
      console.log(`API seats/[id]: Ticket created for seat ${seatId}, now fetching details`);
      
      // Get the created ticket
      const ticketData = await prisma.ticket.findMany({
        where: { seatId: seatId }
      });
      
      console.log(`Successfully reserved seat ${seatId} for ${customerName} (${customerPhone})`);
      
      return res.status(200).json({ 
        ...updatedSeat, 
        ticket: Array.isArray(ticketData) && ticketData.length > 0 ? ticketData[0] : null
      });
    } catch (error: any) {
      console.error('Error reserving seat:', error);
      return res.status(500).json({ 
        message: 'Failed to reserve seat', 
        error: error.message 
      });
    }
  }
  
  console.error(`API seats/[id]: Method ${req.method} not allowed`);
  return res.status(405).json({ message: 'Method not allowed' });
} 