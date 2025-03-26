import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TicketForm from '.';
import { useRouter } from 'next/router';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('TicketForm', () => {
  const mockSession = {
    id: 1,
    movieId: 1,
    time: '10:00',
    movie: {
      title: 'Test Movie',
      duration: 120,
    },
  };

  const mockSeat = {
    id: 1,
    row: 1,
    seat: 1,
    sessionId: 1,
    isReserved: false,
  };

  const mockPush = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <TicketForm
        session={mockSession}
        selectedSeat={mockSeat}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/телефон/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /купить/i })).toBeInTheDocument();
  });

  it('displays session and seat information', () => {
    render(
      <TicketForm
        session={mockSession}
        selectedSeat={mockSeat}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText(mockSession.movie.title)).toBeInTheDocument();
    expect(screen.getByText(/ряд 1 место 1/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <TicketForm
        session={mockSession}
        selectedSeat={mockSeat}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /купить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/имя обязательно/i)).toBeInTheDocument();
      expect(screen.getByText(/email обязателен/i)).toBeInTheDocument();
      expect(screen.getByText(/телефон обязателен/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    render(
      <TicketForm
        session={mockSession}
        selectedSeat={mockSeat}
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/неверный формат email/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /купить/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <TicketForm
        session={mockSession}
        selectedSeat={mockSeat}
        onSubmit={mockOnSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText(/имя/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/телефон/i), {
      target: { value: '+7 (999) 123-45-67' },
    });

    const submitButton = screen.getByRole('button', { name: /купить/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+7 (999) 123-45-67',
      });
    });
  });
}); 