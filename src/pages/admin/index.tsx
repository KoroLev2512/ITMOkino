import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getMovies, deleteMovie } from '@/lib/api';
import { Movie } from '@/entities/movie';
import Link from 'next/link';
import styles from './admin.module.scss';

const AdminDashboard = () => {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ id: number; username: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (!parsedUser.isAdmin) {
      router.push('/');
      return;
    }
    
    setUser(parsedUser);
    
    loadMovies();
  }, [router]);
  
  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (err) {
      setError('Failed to load movies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteMovie = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот фильм?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await deleteMovie(id, token);
      loadMovies();
    } catch (err) {
      setError('Failed to delete movie');
      console.error(err);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }
  
  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Панель администратора</h1>
        <div className={styles.userInfo}>
          {user?.username && <span>Пользователь: {user.username}</span>}
          <button onClick={handleLogout} className={styles.logoutButton}>
            Выйти
          </button>
        </div>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.actionButtons}>
        <Link href="/admin/movies/create">
          <button className={styles.addButton}>Добавить фильм</button>
        </Link>
      </div>
      
      <div className={styles.tableContainer}>
        <h2>Фильмы</h2>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Жанр</th>
              <th>Год</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {movies.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.noData}>Нет фильмов</td>
              </tr>
            ) : (
              movies.map(movie => (
                <tr key={movie.id}>
                  <td>{movie.id}</td>
                  <td>{movie.title}</td>
                  <td>{movie.genre}</td>
                  <td>{movie.year}</td>
                  <td className={styles.actionButtons}>
                    <Link href={`/admin/movies/edit/${movie.id}`}>
                      <button className={styles.editButton}>Редактировать</button>
                    </Link>
                    <Link href={`/admin/sessions/${movie.id}`}>
                      <button className={styles.sessionsButton}>Сеансы</button>
                    </Link>
                    <button 
                      onClick={() => handleDeleteMovie(movie.id)} 
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
        <Link href="/">На главную</Link>
      </div>
    </div>
  );
};

export default AdminDashboard; 