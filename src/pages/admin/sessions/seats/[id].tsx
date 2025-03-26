import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import Link from 'next/link';
import styles from '../../admin.module.scss';

interface Seat {
  id: number;
  row: number;
  seat: number;
  sessionId: number;
  isReserved: boolean;
  ticket?: {
    id: number;
    customerName: string;
    customerPhone: string;
  };
  hasTicket?: boolean;
  customerName?: string;
  customerPhone?: string;
}

interface Session {
  id: number;
  movieId: number;
  startTime: string;
  movie: {
    title: string;
  };
}

interface Props {
  sessionId: number;
}

export default function SessionSeats({ sessionId }: Props) {
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ username?: string; isAdmin?: boolean } | null>(null);

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

  useEffect(() => {
    if (!sessionId || !user?.isAdmin) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        
        // Fetch session data
        const sessionResponse = await axios.get(`/api/sessions/${sessionId}`);
        setSessionData(sessionResponse.data);
        
        // Fetch seats data
        let seatsData;
        try {
          // Try to get seats directly from the session endpoint, which should include seats
          const response = await axios.get(`/api/sessions/${sessionId}`);
          
          if (response.data && response.data.seats) {
            seatsData = response.data.seats;
          } else {
            // Fallback to dedicated seats endpoint if above doesn't work
            const seatsResponse = await axios.get(`/api/sessions/${sessionId}/seats`);
            seatsData = seatsResponse.data;
          }
        } catch (apiError) {
          console.error('Error fetching seats data:', apiError);
          setError('Failed to load seats data');
          setLoading(false);
          return;
        }
        
        // Check if seatsData is an array before using map
        if (!Array.isArray(seatsData)) {
          if (seatsData && typeof seatsData === 'object' && Array.isArray(seatsData.data)) {
            seatsData = seatsData.data;
          } else {
            setSeats([]);
            setError('No seats found for this session');
            setLoading(false);
            return;
          }
        }
        
        // Process seats data to add hasTicket property
        const processedSeats = seatsData.map((seat: Seat) => ({
          ...seat,
          hasTicket: !!seat.ticket,
          customerName: seat.ticket?.customerName || null,
          customerPhone: seat.ticket?.customerPhone || null
        }));
        
        setSeats(processedSeats);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, user]);

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeat(null);
  };

  // Get unique row numbers and sort them
  const rowNumbers = Array.from(new Set(seats.map(seat => seat.row))).sort((a, b) => a - b);

  // Function to get seats for a specific row
  const getSeatsForRow = (rowNumber: number) => {
    return seats
      .filter(seat => seat.row === rowNumber)
      .sort((a, b) => a.seat - b.seat);
  };

  // Function to determine seat status class
  const getSeatStatusClass = (seat: Seat) => {
    if (seat.hasTicket) return styles.soldSeat;
    if (seat.isReserved) return styles.reservedSeat;
    return styles.availableSeat;
  };

  // Function to get seat tooltip text
  const getSeatTooltip = (seat: Seat) => {
    if (seat.hasTicket) {
      return `Ряд ${seat.row}, Место ${seat.seat} - Занято: ${seat.customerName || 'Н/Д'}`;
    }
    if (seat.isReserved) {
      return `Ряд ${seat.row}, Место ${seat.seat} - Забронировано`;
    }
    return `Ряд ${seat.row}, Место ${seat.seat} - Свободно`;
  };

  // Function to get reservation badge
  const getReservationBadge = (seat: Seat) => {
    if (seat.hasTicket && seat.customerName) {
      // Return first letter of customer name
      return seat.customerName.charAt(0).toUpperCase();
    }
    return null;
  };

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.loading}>Загрузка данных...</div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null; // Will redirect in useEffect
  }

  const availableSeatsCount = seats.filter(seat => !seat.isReserved && !seat.hasTicket).length;
  const reservedSeatsCount = seats.filter(seat => seat.isReserved || seat.hasTicket).length;

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1>Места для сеанса: {sessionData?.movie?.title || 'Сеанс'}</h1>
        <div className={styles.userInfo}>
          <Link href="/admin">
            <button className={styles.cancelButton}>Назад</button>
          </Link>
        </div>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <div className={styles.sessionInfo}>
        <h2>Информация о сеансе</h2>
        {sessionData ? (
          <div>
            <p><strong>Фильм:</strong> {sessionData.movie.title}</p>
            <p><strong>Время начала:</strong> {new Date(sessionData.startTime).toLocaleString()}</p>
            <p><strong>ID сеанса:</strong> {sessionData.id}</p>
          </div>
        ) : (
          <p>Загрузка данных о сеансе...</p>
        )}
      </div>

      <div className={styles.seatsContainer}>
        <div className={styles.controls}>
          <h2>Места в зале</h2>
          <div className={styles.seatStats}>
            <p>Всего мест: {seats.length}</p>
            <p>Свободно: {availableSeatsCount} | Занято: {reservedSeatsCount}</p>
          </div>
        </div>

        {seats.length > 0 ? (
          <div className={styles.seatsGrid}>
            <div className={styles.screen}>ЭКРАН</div>
            
            {rowNumbers.map(rowNumber => (
              <div key={rowNumber} className={styles.row}>
                <div className={styles.rowNumber}>Ряд {rowNumber}</div>
                <div className={styles.seats}>
                  {getSeatsForRow(rowNumber).map(seat => (
                    <div
                      key={seat.id}
                      className={`${styles.seat} ${getSeatStatusClass(seat)}`}
                      onClick={() => handleSeatClick(seat)}
                      title={getSeatTooltip(seat)}
                    >
                      {getReservationBadge(seat) || seat.seat}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.availableSeat}`}></div>
                <span>Свободно</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.reservedSeat}`}></div>
                <span>Забронировано</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.soldSeat}`}></div>
                <span>Занято</span>
              </div>
            </div>
          </div>
        ) : (
          <p>Для этого сеанса не найдено мест.</p>
        )}
      </div>

      {isModalOpen && selectedSeat && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Информация о месте</h3>
            <p><strong>Ряд:</strong> {selectedSeat.row}</p>
            <p><strong>Место:</strong> {selectedSeat.seat}</p>
            
            <p><strong>Статус:</strong> {
              selectedSeat.hasTicket 
                ? 'Занято' 
                : (selectedSeat.isReserved ? 'Забронировано' : 'Свободно')
            }</p>
            
            {selectedSeat.hasTicket && selectedSeat.customerName && (
              <div className={styles.customerInfo}>
                <h4>Информация о покупателе</h4>
                <p><strong>Имя:</strong> {selectedSeat.customerName || 'Не указано'}</p>
                <p><strong>Телефон:</strong> {selectedSeat.customerPhone || 'Не указан'}</p>
              </div>
            )}
            
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={closeModal} className={styles.cancelButton}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };
  
  return {
    props: {
      sessionId: parseInt(id, 10),
    },
  };
};
