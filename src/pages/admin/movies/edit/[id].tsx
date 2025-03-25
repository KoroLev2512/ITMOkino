import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getMovie, updateMovie } from '@/lib/api';
import styles from '../../admin.module.scss';

// Movie type based on API response
interface MovieFormData {
  id?: number;
  title: string;
  genre: string;
  description: string;
  image: string;
  duration: number;
  premiere: string; // For the form we use string for date input
  year: number;
  actors: string; // Store as JSON string in the form
}

const EditMoviePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    genre: '',
    description: '',
    image: '',
    duration: 0,
    premiere: '',
    year: 0,
    actors: '[]'
  });

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
    
    // Fetch movie data
    if (id) {
      loadMovie(Number(id));
    }
  }, [id, router]);
  
  const loadMovie = async (movieId: number) => {
    setLoading(true);
    try {
      const data = await getMovie(movieId);
      
      // Convert premiere date to YYYY-MM-DD format for input field
      const premiereDate = new Date(data.premiere);
      const formattedPremiereDate = premiereDate.toISOString().split('T')[0];
      
      setFormData({
        ...data,
        premiere: formattedPremiereDate,
        actors: typeof data.actors === 'string' ? data.actors : JSON.stringify(data.actors)
      });
    } catch (err) {
      setError('Failed to load movie');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'year' ? parseInt(value) || 0 : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      if (!id) {
        throw new Error('Movie ID is required');
      }
      
      // Prepare the data for the API
      const movieData = {
        ...formData,
        id: Number(id),
        // Parse actors from JSON string to array for API
        actors: JSON.parse(formData.actors)
      };
      
      await updateMovie(Number(id), movieData, token);
      router.push('/admin');
    } catch (err) {
      setError('Failed to update movie');
      console.error(err);
    }
  };
  
  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }
  
  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Редактирование фильма</h1>
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
            <label htmlFor="actors">Актеры (JSON)</label>
            <textarea
              id="actors"
              name="actors"
              value={formData.actors}
              onChange={handleChange}
              required
              rows={2}
            />
          </div>
          
          <div className={styles.formActions}>
            <button type="submit" className={styles.addButton}>Сохранить</button>
            <Link href="/admin">
              <button type="button" className={styles.cancelButton}>Отмена</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMoviePage; 