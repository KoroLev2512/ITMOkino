import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getMovie, getSessions, createSession, deleteSession } from '@/lib/api';
import styles from '../admin.module.scss';

interface Session {
  id: number;
  time: string;
  movieId: number;
}

interface Movie {
  id: number;
  title: string;
}

const AdminMovieSessionsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [newSessionTime, setNewSessionTime] = useState('');
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editSessionTime, setEditSessionTime] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.isAdmin) {
        router.push('/');
        return;
      }
    } catch (e) {
      router.push('/login');
      return;
    }
    
    // Fetch movie and sessions
    if (id) {
      loadData(Number(id));
    }
  }, [id, router]);
  
  const loadData = async (movieId: number) => {
    setLoading(true);
    setError('');
    try {
      console.log(`Loading data for movie ID: ${movieId}`);
      
      // Load movie details
      let movieData;
      try {
        movieData = await getMovie(movieId);
        console.log('Movie data loaded:', movieData);
        
        if (!movieData) {
          throw new Error('No movie data received');
        }
        
        setMovie({
          id: movieData.id,
          title: movieData.title
        });
      } catch (movieErr) {
        console.error('Error loading movie:', movieErr);
        setDebugInfo({ type: 'movie_error', error: movieErr, movieId });
        setError(`Failed to load movie data: ${movieErr.message || 'Unknown error'}`);
        setLoading(false);
        return;
      }
      
      // Load sessions for this movie
      try {
        const sessionsData = await getSessions(movieId);
        console.log('Sessions data loaded:', sessionsData);
        
        if (Array.isArray(sessionsData)) {
          setSessions(sessionsData);
        } else {
          console.error('Sessions data is not an array:', sessionsData);
          setDebugInfo({ type: 'sessions_not_array', data: sessionsData });
          setSessions([]);
        }
      } catch (sessionsErr) {
        console.error('Error loading sessions:', sessionsErr);
        setDebugInfo({ type: 'sessions_error', error: sessionsErr });
        setError(`Failed to load sessions: ${sessionsErr.message || 'Unknown error'}`);
        // We still want to show the page with the movie info, just no sessions
        setSessions([]);
      }
    } catch (err) {
      console.error('General error in loadData:', err);
      setDebugInfo({ type: 'general_error', error: err });
      setError(`Failed to load data: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSessionTime || !id) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const sessionData = {
        time: newSessionTime,
        movieId: Number(id)
      };
      
      await createSession(sessionData, token);
      setNewSessionTime('');
      
      // Reload sessions
      const updatedSessions = await getSessions(Number(id));
      if (Array.isArray(updatedSessions)) {
        setSessions(updatedSessions);
      }
    } catch (err) {
      setError(`Failed to create session: ${err.message || 'Unknown error'}`);
      console.error(err);
    }
  };
  
  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот сеанс?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await deleteSession(sessionId, token);
      
      // Remove from local state
      setSessions(sessions.filter(session => session.id !== sessionId));
    } catch (err) {
      setError(`Failed to delete session: ${err.message || 'Unknown error'}`);
      console.error(err);
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setEditSessionTime(session.time);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingSession || !editSessionTime) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Update session with API
      await fetch(`/api/sessions/${editingSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          time: editSessionTime,
          movieId: editingSession.movieId
        })
      });
      
      // Update local state
      setSessions(sessions.map(session => 
        session.id === editingSession.id 
          ? { ...session, time: editSessionTime } 
          : session
      ));
      
      // Reset editing state
      setEditingSession(null);
      setEditSessionTime('');
    } catch (err) {
      setError(`Failed to update session: ${err.message || 'Unknown error'}`);
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditSessionTime('');
  };
  
  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }
  
  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Сеансы фильма: {movie?.title}</h1>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {/* Debug info for troubleshooting */}
      {debugInfo && (
        <div className={styles.debugInfo}>
          <details>
            <summary>Техническая информация (для отладки)</summary>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        </div>
      )}
      
      <div className={styles.tableContainer}>
        <h2>Добавить новый сеанс</h2>
        <form onSubmit={handleAddSession} className={styles.addSessionForm}>
          <div className={styles.formGroup}>
            <label htmlFor="time">Время сеанса (HH:MM)</label>
            <input
              type="time"
              id="time"
              value={newSessionTime}
              onChange={(e) => setNewSessionTime(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.addButton}>Добавить сеанс</button>
        </form>
      </div>
      
      {editingSession && (
        <div className={styles.tableContainer}>
          <h2>Редактировать сеанс</h2>
          <form onSubmit={handleSaveEdit} className={styles.addSessionForm}>
            <div className={styles.formGroup}>
              <label htmlFor="editTime">Время сеанса (HH:MM)</label>
              <input
                type="time"
                id="editTime"
                value={editSessionTime}
                onChange={(e) => setEditSessionTime(e.target.value)}
                required
              />
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.editButton}>Сохранить</button>
              <button type="button" onClick={handleCancelEdit} className={styles.cancelButton}>Отмена</button>
            </div>
          </form>
        </div>
      )}
      
      <div className={styles.tableContainer}>
        <h2>Существующие сеансы</h2>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Время</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={3} className={styles.noData}>Нет сеансов</td>
              </tr>
            ) : (
              sessions.map(session => (
                <tr key={session.id}>
                  <td>{session.id}</td>
                  <td>{session.time}</td>
                  <td className={styles.actionButtons}>
                    <button 
                      onClick={() => handleEditSession(session)}
                      className={styles.editButton}
                    >
                      Редактировать
                    </button>
                    <Link href={`/admin/sessions/seats/${session.id}`}>
                      <button className={styles.viewButton}>
                        Просмотр мест
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      className={styles.deleteButton}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className={styles.backLink}>
        <Link href="/admin">Назад к списку фильмов</Link>
      </div>
    </div>
  );
};

export default AdminMovieSessionsPage; 