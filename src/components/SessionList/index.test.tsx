import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SessionList from '.';
import { Session } from '@prisma/client';

describe('SessionList', () => {
  const mockSessions: (Session & { movie: { title: string } })[] = [
    {
      id: 1,
      movieId: 1,
      time: '10:00',
      movie: {
        title: 'Movie 1',
      },
    },
    {
      id: 2,
      movieId: 1,
      time: '13:00',
      movie: {
        title: 'Movie 1',
      },
    },
    {
      id: 3,
      movieId: 2,
      time: '16:00',
      movie: {
        title: 'Movie 2',
      },
    },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all sessions correctly', () => {
    render(<SessionList sessions={mockSessions} onSelect={mockOnSelect} />);

    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('13:00')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
    expect(screen.getByText('16:00')).toBeInTheDocument();
  });

  it('groups sessions by movie', () => {
    render(<SessionList sessions={mockSessions} onSelect={mockOnSelect} />);

    expect(screen.getAllByText('Movie 1')).toHaveLength(1);
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
  });

  it('calls onSelect with session ID when clicking a session', () => {
    render(<SessionList sessions={mockSessions} onSelect={mockOnSelect} />);

    const sessionButton = screen.getByText('10:00');
    fireEvent.click(sessionButton);

    expect(mockOnSelect).toHaveBeenCalledWith(1);
  });

  it('displays empty state when no sessions are provided', () => {
    render(<SessionList sessions={[]} onSelect={mockOnSelect} />);

    expect(screen.getByText(/нет доступных сеансов/i)).toBeInTheDocument();
  });

  it('displays correct time format', () => {
    render(<SessionList sessions={mockSessions} onSelect={mockOnSelect} />);

    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('13:00')).toBeInTheDocument();
    expect(screen.getByText('16:00')).toBeInTheDocument();
  });
}); 