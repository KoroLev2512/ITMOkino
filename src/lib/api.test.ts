import axios from 'axios';
import { getMovies, getMovie, getSessions, reserveSeat, login } from './api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getMovies should fetch movies correctly', async () => {
    const mockMovies = [
      {
        id: 1,
        title: 'Test Movie',
        // ... other movie properties
      },
    ];
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockMovies });
    
    const result = await getMovies();
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/movies');
    expect(result).toEqual(mockMovies);
  });

  it('getMovie should fetch a single movie correctly', async () => {
    const mockMovie = {
      id: 1,
      title: 'Test Movie',
      // ... other movie properties
    };
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockMovie });
    
    const result = await getMovie(1);
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/movies/1');
    expect(result).toEqual(mockMovie);
  });

  it('getSessions should fetch sessions correctly', async () => {
    const mockSessions = [
      {
        id: 1,
        time: '18:00',
        // ... other session properties
      },
    ];
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockSessions });
    
    const result = await getSessions();
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/sessions');
    expect(result).toEqual(mockSessions);
  });

  it('reserveSeat should reserve a seat correctly', async () => {
    const mockSeat = {
      id: 1,
      row: 2,
      seat: 5,
      isReserved: true,
      // ... other seat properties
    };
    
    const customerData = {
      customerName: 'John Doe',
      customerPhone: '1234567890',
    };
    
    mockedAxios.put.mockResolvedValueOnce({ data: mockSeat });
    
    const result = await reserveSeat(1, customerData);
    
    expect(mockedAxios.put).toHaveBeenCalledWith('/api/seats/1', customerData);
    expect(result).toEqual(mockSeat);
  });

  it('login should authenticate correctly', async () => {
    const mockAuthData = {
      token: 'test-token',
      user: {
        id: 1,
        username: 'admin',
        isAdmin: true,
      },
    };
    
    const credentials = {
      username: 'admin',
      password: 'password',
    };
    
    mockedAxios.post.mockResolvedValueOnce({ data: mockAuthData });
    
    const result = await login(credentials);
    
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', credentials);
    expect(result).toEqual(mockAuthData);
  });
}); 