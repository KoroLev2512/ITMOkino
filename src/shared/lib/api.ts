import axios from 'axios';

// For client-side API calls, use relative URLs or the full base URL if available
// For server-side calls (SSR), use the full URL with the host

// Get the base URL or use a relative path if we're on the client
const getBaseUrl = () => {
  // Check if we're running on the server or in the browser
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    // On server during SSR, we need the full URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    return baseUrl;
  }
  
  // In browser, we can use relative URLs
  return '';
};

// Movies
export const getMovies = async () => {
  const response = await axios.get(`${getBaseUrl()}/api/movies`);
  return response.data;
};

export const getMovie = async (id: number) => {
  const response = await axios.get(`${getBaseUrl()}/api/movies/${id}`);
  return response.data;
};

// Sessions
export const getSessions = async (movieId?: number) => {
  // Don't add movieId parameter when it's undefined
  const url = movieId !== undefined ? `/api/sessions?movieId=${movieId}` : '/api/sessions';
  const response = await axios.get(url);
  return response.data;
};

export const getSession = async (id: number) => {
  const response = await axios.get(`${getBaseUrl()}/api/sessions/${id}`);
  return response.data;
};

// Seats
export const getSeat = async (id: number) => {
  const response = await axios.get(`${getBaseUrl()}/api/seats/${id}`);
  return response.data;
};

export const reserveSeat = async (id: number, customerData: { customerName: string; customerPhone: string }) => {
  const response = await axios.put(`${getBaseUrl()}/api/seats/${id}`, customerData);
  return response.data;
};

// Auth
export const login = async (credentials: { username: string; password: string }) => {
  const response = await axios.post(`${getBaseUrl()}/api/auth/login`, credentials);
  return response.data;
};

// Admin functions
export const getTickets = async (token: string) => {
  const response = await axios.get(`${getBaseUrl()}/api/tickets`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteTicket = async (id: number, token: string) => {
  await axios.delete(`${getBaseUrl()}/api/tickets/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createMovie = async (movieData: any, token: string) => {
  const response = await axios.post(`${getBaseUrl()}/api/movies`, movieData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMovie = async (id: number, movieData: any, token: string) => {
  const response = await axios.put(`${getBaseUrl()}/api/movies/${id}`, movieData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteMovie = async (id: number, token: string) => {
  await axios.delete(`${getBaseUrl()}/api/movies/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createSession = async (sessionData: { time: string; movieId: number }, token: string) => {
  const response = await axios.post(
    `${getBaseUrl()}/api/sessions`, 
    sessionData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const updateSession = async (id: number, sessionData: { time: string; movieId: number }, token: string) => {
  const response = await axios.put(
    `${getBaseUrl()}/api/sessions/${id}`, 
    sessionData,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const deleteSession = async (id: number, token: string) => {
  const response = await axios.delete(
    `${getBaseUrl()}/api/sessions/${id}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
}; 