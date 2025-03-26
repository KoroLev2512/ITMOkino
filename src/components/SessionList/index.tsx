import React from 'react';
import { Session } from '@prisma/client';

interface SessionListProps {
  sessions: (Session & { movie: { title: string } })[];
  onSelect: (sessionId: number) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onSelect }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        В данный момент нет доступных сеансов
      </div>
    );
  }

  const groupedSessions = sessions.reduce((acc, session) => {
    const movieTitle = session.movie.title;
    if (!acc[movieTitle]) {
      acc[movieTitle] = [];
    }
    acc[movieTitle].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedSessions).map(([movieTitle, movieSessions]) => (
        <div key={movieTitle} className="bg-white rounded-lg p-4 shadow">
          <h3 className="text-xl font-semibold mb-4">{movieTitle}</h3>
          <div className="flex flex-wrap gap-2">
            {movieSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelect(session.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {session.time}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionList; 