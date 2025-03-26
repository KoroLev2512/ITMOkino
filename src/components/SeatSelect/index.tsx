import React from 'react';
import { Seat } from '@prisma/client';

interface SeatSelectProps {
  seats: Seat[];
  onSelect: (seatId: number) => void;
}

const SeatSelect: React.FC<SeatSelectProps> = ({ seats, onSelect }) => {
  const rows = Math.max(...seats.map(seat => seat.row));
  const seatsPerRow = Math.max(...seats.map(seat => seat.seat));

  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex + 1} className="flex items-center space-x-2">
          <span className="font-medium">Ряд {rowIndex + 1}</span>
          {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
            const seat = seats.find(s => s.row === rowIndex + 1 && s.seat === seatIndex + 1);
            return (
              <button
                key={seatIndex + 1}
                onClick={() => seat && !seat.isReserved && onSelect(seat.id)}
                disabled={seat?.isReserved}
                className={`w-8 h-8 rounded ${
                  seat?.isReserved
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {seatIndex + 1}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SeatSelect; 