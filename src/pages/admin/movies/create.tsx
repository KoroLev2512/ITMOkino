import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createMovie } from '@/lib/api';
import styles from '../admin.module.scss';

interface MovieFormData {
  title: string;
  description: string;
  image: string;
  genre: string;
  year: number;
  duration: number;
  actors: string;
}

const CreateMoviePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    description: '',
    image: '/images/kino.jpg', // Default image path
    genre: '',
    year: new Date().getFullYear(),
    duration: 120,
    actors: '',
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
      [name]: name === 'year' || name === 'duration' ? parseInt(value) : value
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
      // Convert actors string to array
      const actorsArray = formData.actors.split(',').map(actor => actor.trim()).filter(Boolean);
      
      const movieData = {
        ...formData,
        actors: actorsArray
      };
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await createMovie(movieData, token);
      router.push('/admin');
    } catch (err: any) {
      console.error('Error creating movie:', err);
      setError(err.response?.data?.message || 'Failed to create movie');
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
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
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
          <label htmlFor="year">Год выпуска</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1900"
            max="2100"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="duration">Продолжительность (минут)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="actors">Актеры (через запятую)</label>
          <input
            type="text"
            id="actors"
            name="actors"
            value={formData.actors}
            onChange={handleChange}
            placeholder="Актер 1, Актер 2, Актер 3"
          />
        </div>
        
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.addButton}
            disabled={loading}
          >
            {loading ? 'Создание...' : 'Создать фильм'}
          </button>
          
          <Link href="/admin">
            <button type="button" className={styles.cancelButton}>
              Отмена
            </button>
          </Link>
        </div>
      </form>
      
      <div className={styles.backLinks}>
        <Link href="/admin">
          <button className={styles.cancelButton}>Назад к списку фильмов</button>
        </Link>
      </div>
    </div>
  );
};

export default CreateMoviePage; 