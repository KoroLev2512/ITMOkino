import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SeatSelect from './index';
import { Seat } from '@prisma/client';

describe('SeatSelect', () => {
  const mockSeats: Seat[] = [
    { id: 1, row: 1, seat: 1, sessionId: 1, isReserved: false },
    { id: 2, row: 1, seat: 2, sessionId: 1, isReserved: true },
    { id: 3, row: 2, seat: 1, sessionId: 1, isReserved: false },
    { id: 4, row: 2, seat: 2, sessionId: 1, isReserved: false },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all seats correctly', () => {
    render(<SeatSelect seats={mockSeats} onSelect={mockOnSelect} />);

    expect(screen.getByText('Ряд 1')).toBeInTheDocument();
    expect(screen.getByText('Ряд 2')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('disables reserved seats', () => {
    render(<SeatSelect seats={mockSeats} onSelect={mockOnSelect} />);

    const reservedSeat = screen.getByRole('button', { name: /ряд 1 место 2/i });
    expect(reservedSeat).toBeDisabled();
  });

  it('calls onSelect with seat ID when clicking an available seat', () => {
    render(<SeatSelect seats={mockSeats} onSelect={mockOnSelect} />);

    const availableSeat = screen.getByRole('button', { name: /ряд 1 место 1/i });
    fireEvent.click(availableSeat);

    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it('does not call onSelect when clicking a reserved seat', () => {
    render(<SeatSelect seats={mockSeats} onSelect={mockOnSelect} />);

    const reservedSeat = screen.getByRole('button', { name: /ряд 1 место 2/i });
    fireEvent.click(reservedSeat);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('displays correct seat numbers for each row', () => {
    render(<SeatSelect seats={mockSeats} onSelect={mockOnSelect} />);

    expect(screen.getByText('Место 1')).toBeInTheDocument();
    expect(screen.getByText('Место 2')).toBeInTheDocument();
  });
}); 