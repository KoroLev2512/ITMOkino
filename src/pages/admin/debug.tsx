import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';

const DebugAuthPage = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get the token from localStorage when the component mounts
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get('/api/debug-auth', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setResult(response.data);
    } catch (err) {
      console.error('Error testing token:', err);
      if (err instanceof Error) {
        setError(err.message || 'An error occurred');
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setToken('');
    setResult(null);
    setError(null);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/auth/login', {
        username: 'admin',
        password: 'admin123'
      });
      
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('auth_token', newToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setResult({
        message: 'Login successful',
        token: newToken,
        user: response.data.user
      });
    } catch (err) {
      console.error('Login error:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || 'Login failed');
      } else if (err instanceof Error) {
        setError(err.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Auth Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Current Token</h2>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ width: '100%', height: '100px', marginBottom: '10px' }}
        />
        <div>
          <button 
            onClick={handleTest} 
            disabled={loading || !token}
            style={{ marginRight: '10px' }}
          >
            Test Token
          </button>
          <button 
            onClick={handleLogout}
            style={{ marginRight: '10px' }}
          >
            Logout
          </button>
          <button 
            onClick={handleLogin}
            disabled={loading}
          >
            Login as Admin
          </button>
        </div>
      </div>
      
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      
      {result && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Result</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            border: '1px solid #ddd',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <Link href="/admin">Back to Admin Dashboard</Link>
      </div>
    </div>
  );
};

export default DebugAuthPage; 