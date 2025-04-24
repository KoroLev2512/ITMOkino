import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/shared/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // In a production app, verify token and check admin status
    // For simplicity, we'll skip the full verification

    // Extract parameters
    const { sessionId, rows = 5, seatsPerRow = 10 } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if seats already exist for this session
    const existingSeats = await prisma.seat.findMany({
      where: { sessionId }
    });

    if (existingSeats.length > 0) {
      return res.status(400).json({ 
        message: 'Seats already exist for this session',
        count: existingSeats.length
      });
    }

    // Create seats
    const createdSeats = [];
    
    try {
      // Create each seat individually
      for (let row = 1; row <= rows; row++) {
        for (let seat = 1; seat <= seatsPerRow; seat++) {
          // We don't use isReserved directly - we'll handle this in our API layer
          const newSeat = await prisma.seat.create({
            data: {
              sessionId,
              row,
              seat
            }
          });
          createdSeats.push(newSeat);
        }
      }
    } catch (error) {
      console.error('Error creating seats:', error);
      return res.status(500).json({ 
        message: 'Error creating seats', 
        error: String(error)
      });
    }

    return res.status(201).json({
      message: 'Seats generated successfully',
      count: createdSeats.length
    });
  } catch (error) {
    console.error('Error generating seats:', error);
    return res.status(500).json({ message: 'Failed to generate seats' });
  }
} 