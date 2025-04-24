import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createMovie } from '@/shared/lib/api';
import styles from '../admin.module.scss';

// Match the interface from edit page
interface MovieFormData {
  title: string;
  genre: string;
  description: string;
  image: string;
  duration: number;
  premiere: string; // For the form we use string for date input
  year: number;
  actors: string; // Store as JSON string in the form, just like in edit page
}

const CreateMoviePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    genre: '',
    description: '',
    image: '',
    duration: 120,
    premiere: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    year: new Date().getFullYear(),
    actors: '' // Empty string instead of JSON array
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<{ username?: string, isAdmin?: boolean } | null>(null);

  useEffect(() => {
    // Check if user is authenticated and is admin
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userData || !token) {
      router.push('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (!parsedUser.isAdmin) {
        router.push('/');
        return;
      }
    } catch (e) {
      router.push('/login');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'duration' ? parseInt(value) || 0 : value
    }));
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get authentication token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Process the actors field - convert from comma-separated string to array
      const actorsArray = formData.actors
        .split(',')
        .map(actor => actor.trim())
        .filter(Boolean);
      
      // Prepare the data for the API
      const movieData = {
        ...formData,
        actors: actorsArray // Use array directly instead of parsing JSON
      };
      
      console.log('Submitting movie data:', movieData);
      await createMovie(movieData, token);
      router.push('/admin');
    } catch (err: any) {
      console.error('Error creating movie:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create movie');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Создать новый фильм</h1>
        <div className={styles.userInfo}>
          {user?.username && <span>Пользователь: {user.username}</span>}
          <button onClick={handleLogout} className={styles.logoutButton}>Выйти</button>
        </div>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.tableContainer}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Название</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="genre">Жанр</label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="image">URL изображения</label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="duration">Длительность (минуты)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="premiere">Дата премьеры</label>
            <input
              type="date"
              id="premiere"
              name="premiere"
              value={formData.premiere}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="year">Год выпуска</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max="2100"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="actors">Актеры (через запятую)</label>
            <textarea
              id="actors"
              name="actors"
              value={formData.actors}
              onChange={handleChange}
              required
              rows={2}
              placeholder="Актер 1, Актер 2, Актер 3"
            />
          </div>
          
          <div className={styles.formActions}>
            <button type="submit" className={styles.addButton}>Создать</button>
            <Link href="/admin">
              <button type="button" className={styles.cancelButton}>Отмена</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMoviePage; 