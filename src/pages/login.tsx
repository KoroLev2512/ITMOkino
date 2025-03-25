import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { login } from '@/lib/api';
import { Text } from '@/shared/ui/Text';
import styles from './auth.module.scss';

const LoginPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ username, password });
      
      // Store token in localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect based on user role
      if (response.user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <Text center className={styles.authTitle}>Вход в систему</Text>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Имя пользователя</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.authInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.authInput}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className={styles.authButton}
          >
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>
        
        <div className={styles.authLinks}>
          <p>Нет аккаунта? <Link href="/register" className={styles.authLink}>Зарегистрироваться</Link></p>
          <Link href="/" className={styles.authLink}>На главную</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 