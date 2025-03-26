import React from 'react';
import { Movie } from '@prisma/client';
import MovieCard from '../MovieCard';

interface MovieListProps {
  movies: Movie[];
}

const MovieList: React.FC<MovieListProps> = ({ movies }) => {
  if (movies.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        В данный момент нет доступных фильмов
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieList; 