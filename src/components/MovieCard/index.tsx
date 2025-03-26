import React from 'react';
import { Movie } from '@prisma/client';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/movies/${movie.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 w-full">
        <Image
          src={movie.image || '/placeholder.jpg'}
          alt={movie.title}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
        <p className="text-gray-600 mb-2">{movie.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">{movie.duration} мин</span>
          <span className="text-gray-500">{movie.genre}</span>
        </div>
      </div>
    </button>
  );
};

export default MovieCard; 