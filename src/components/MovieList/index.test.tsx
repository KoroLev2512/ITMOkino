import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MovieList from './index';
import { Movie } from '@prisma/client';

describe('MovieList', () => {
  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Movie 1',
      description: 'Description 1',
      duration: 120,
      image: 'movie1.jpg',
      genre: 'Action',
      year: 2023,
      actors: ['Actor 1', 'Actor 2'],
      premiere: new Date(),
    },
    {
      id: 2,
      title: 'Movie 2',
      description: 'Description 2',
      duration: 150,
      image: 'movie2.jpg',
      genre: 'Drama',
      year: 2023,
      actors: ['Actor 3', 'Actor 4'],
      premiere: new Date(),
    },
  ];

  it('renders all movies correctly', () => {
    render(<MovieList movies={mockMovies} />);

    expect(screen.getByText('Movie 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('120 мин')).toBeInTheDocument();
    expect(screen.getByText('Movie 2')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
    expect(screen.getByText('150 мин')).toBeInTheDocument();
  });

  it('displays movie images correctly', () => {
    render(<MovieList movies={mockMovies} />);

    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'movie1.jpg');
    expect(images[1]).toHaveAttribute('src', 'movie2.jpg');
  });

  it('displays placeholder image when image is not provided', () => {
    const moviesWithoutImage = mockMovies.map(movie => ({
      ...movie,
      image: '',
    }));

    render(<MovieList movies={moviesWithoutImage} />);

    const images = screen.getAllByRole('img');
    images.forEach(image => {
      expect(image).toHaveAttribute('src', '/placeholder.jpg');
    });
  });

  it('displays empty state when no movies are provided', () => {
    render(<MovieList movies={[]} />);

    expect(screen.getByText(/нет доступных фильмов/i)).toBeInTheDocument();
  });

  it('displays movie genres', () => {
    render(<MovieList movies={mockMovies} />);

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
  });
}); 