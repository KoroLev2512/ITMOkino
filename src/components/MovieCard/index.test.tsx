import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MovieCard from '.';
import { useRouter } from 'next/router';
import { Movie } from '@prisma/client';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('MovieCard', () => {
  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    description: 'Test Description',
    image: 'test-poster.jpg',
    duration: 120,
    genre: 'Action',
    year: 2023,
    actors: ['Actor 1', 'Actor 2'],
    premiere: new Date(),
  };

  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it('renders movie information correctly', () => {
    render(<MovieCard movie={mockMovie} />);

    expect(screen.getByText(mockMovie.title)).toBeInTheDocument();
    expect(screen.getByText(mockMovie.description)).toBeInTheDocument();
    expect(screen.getByText('120 мин')).toBeInTheDocument();
    expect(screen.getByAltText(mockMovie.title)).toBeInTheDocument();
  });

  it('navigates to movie details page when clicked', () => {
    render(<MovieCard movie={mockMovie} />);

    const linkElement = screen.getByRole('link', { name: /test movie/i });
    fireEvent.click(linkElement);

    expect(mockPush).toHaveBeenCalledWith(`/movies/${mockMovie.id}`);
  });

  it('displays placeholder image when image is not provided', () => {
    const movieWithoutImage = { ...mockMovie, image: '' };
    render(<MovieCard movie={movieWithoutImage} />);

    expect(screen.getByAltText(mockMovie.title)).toHaveAttribute(
      'src',
      expect.stringContaining('placeholder')
    );
  });
}); 