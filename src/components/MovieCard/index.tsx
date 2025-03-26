import React from 'react';
import { Movie } from '@prisma/client';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/movies/${movie.id}`);
  };

  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="relative w-full h-64 rounded-lg overflow-hidden">
        <Image
          src={movie.image || 'https://via.placeholder.com/300x450'}
          alt={movie.title}
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="mt-2">
        <h3 className="text-lg font-semibold">{movie.title}</h3>
        <p className="text-gray-600">{movie.description}</p>
        <p className="text-gray-500">{movie.duration} мин</p>
      </div>
    </Link>
  );
};

export default MovieCard; 