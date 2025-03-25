import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../../admin.module.scss';

interface Seat {
  id: number;
  row: number;
  seat: number;
  sessionId: number;
  isReserved: boolean;
  hasTicket: boolean;
  customerName?: string;
  customerPhone?: string;
}

const SessionSeatsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [movieId, setMovieId] = useState<number | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ time: string; movieTitle: string } | null>(null);
  const [apiData, setApiData] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

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
    
    // Fetch seats for this session
    if (id) {
      loadData(Number(id));
    }
  }, [id, router]);
  
  const loadData = async (sessionId: number) => {
    setLoading(true);
    try {
      // Use the new admin API endpoint to get all session and seat data in one request
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/admin/session-seats/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch session seats data');
      }
      
      const data = await response.json();
      
      // Set session info
      setMovieId(data.session.movieId);
      setSessionInfo({
        time: data.session.time,
        movieTitle: data.session.movieTitle
      });
      
      // Set seats data
      setApiData(data.seats);
      
      // If no seats data, create a message but don't generate fake data
      if (data.seats.length === 0) {
        setError('Нет данных о местах. Создайте места для этого сеанса.');
        setSeats([]);
      } else {
        setError('');
        setSeats(data.seats);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSeats = async () => {
    if (!id) return;
    
    setGenerating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Generate 5 rows with 10 seats each
      const result = await fetch('/api/seats/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: Number(id),
          rows: 5,
          seatsPerRow: 10
        })
      });
      
      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || 'Failed to generate seats');
      }
      
      // Reload data
      loadData(Number(id));
    } catch (err: any) {
      setError(err.message || 'Failed to generate seats');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };
  
  const getStatusClass = (seat: Seat) => {
    if (!seat.isReserved) return styles.availableSeat;
    return seat.hasTicket ? styles.soldSeat : styles.reservedSeat;
  };
  
  const getStatusLabel = (seat: Seat) => {
    if (!seat.isReserved) return 'Доступно';
    return seat.hasTicket ? 'Продано' : 'Забронировано';
  };

  const handleSeatClick = (seat: Seat) => {
    if (seat.isReserved) {
      setSelectedSeat(seat);
    }
  };

  const closeSeatDetails = () => {
    setSelectedSeat(null);
  };
  
  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }
  
  // Group seats by row
  const seatsByRow = seats.reduce<Record<number, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});
  
  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Места для сеанса</h1>
        {sessionInfo && (
          <div>
            <p>Фильм: {sessionInfo.movieTitle}</p>
            <p>Время: {sessionInfo.time}</p>
          </div>
        )}
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {seats.length === 0 && (
        <div className={styles.tableContainer}>
          <h2>Создать места для сеанса</h2>
          <p>Данный сеанс не имеет мест. Вы можете создать стандартный набор мест (5 рядов по 10 мест).</p>
          <button 
            onClick={generateSeats} 
            className={styles.addButton}
            disabled={generating}
          >
            {generating ? 'Создание мест...' : 'Создать места'}
          </button>
        </div>
      )}
      
      <div className={styles.seatsContainer}>
        <h2>Места в зале</h2>
        
        {/* Debug information section */}
        <div className={styles.debugInfo}>
          <details>
            <summary>Техническая информация (для отладки)</summary>
            <pre>{JSON.stringify(apiData, null, 2)}</pre>
          </details>
        </div>
        
        {Object.keys(seatsByRow).length === 0 ? (
          <div className={styles.noData}>Нет данных о местах</div>
        ) : (
          <div className={styles.seatsGrid}>
            <div className={styles.screen}>Экран</div>
            
            {Object.entries(seatsByRow).map(([row, rowSeats]) => (
              <div key={row} className={styles.seatRow}>
                <div className={styles.rowNumber}>Ряд {row}</div>
                <div className={styles.seats}>
                  {rowSeats
                    .sort((a, b) => a.seat - b.seat)
                    .map(seat => (
                      <div 
                        key={seat.id} 
                        className={`${styles.seat} ${getStatusClass(seat)}`}
                        title={`Ряд ${seat.row}, Место ${seat.seat}: ${getStatusLabel(seat)}`}
                        onClick={() => handleSeatClick(seat)}
                      >
                        <span className={styles.seatNumber}>{seat.seat}</span>
                        <span className={styles.seatStatus}>{getStatusLabel(seat)}</span>
                        {seat.isReserved && (
                          <span className={styles.seatInfo}>i</span>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
            
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.availableSeat}`}></div>
                <span>Доступно</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.reservedSeat}`}></div>
                <span>Забронировано</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.soldSeat}`}></div>
                <span>Продано</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {selectedSeat && (
        <div className={styles.seatDetailsModal}>
          <div className={styles.seatDetailsContent}>
            <h3>Информация о бронировании</h3>
            <p><strong>Ряд:</strong> {selectedSeat.row}</p>
            <p><strong>Место:</strong> {selectedSeat.seat}</p>
            <p><strong>Статус:</strong> {getStatusLabel(selectedSeat)}</p>
            
            {selectedSeat.customerName && (
              <>
                <p><strong>Имя клиента:</strong> {selectedSeat.customerName}</p>
                {selectedSeat.customerPhone && (
                  <p><strong>Телефон:</strong> {selectedSeat.customerPhone}</p>
                )}
              </>
            )}
            
            {!selectedSeat.customerName && selectedSeat.isReserved && (
              <p className={styles.noCustomerInfo}>Нет информации о клиенте</p>
            )}
            
            <button 
              onClick={closeSeatDetails}
              className={styles.closeButton}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
      
      <div className={styles.backLink}>
        {movieId && (
          <Link href={`/admin/sessions/${movieId}`}>
            Назад к сеансам
          </Link>
        )}
      </div>
    </div>
  );
};

export default SessionSeatsPage; 