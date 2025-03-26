import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import styles from '../../admin.module.scss';
import AdminLayout from '@/widgets/adminLayout';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId) return;
      
      try {
        const response = await axios.get(`/api/admin/sessions/${sessionId}`);
        setSessionData(response.data);
      } catch (error) {
        console.error('Error fetching session data:', error);
        setError('Failed to load session data');
      }
    };

    const fetchSeats = async () => {
      if (!sessionId) return;
      
      setLoading(true);
      try {
        // Try to get seats from admin API first
        let seatsData;
        try {
          const response = await axios.get(`/api/admin/session-seats/${sessionId}`);
          seatsData = response.data;
        } catch (adminError) {
          // Fallback to regular API if admin API fails
          console.log('Falling back to regular API for seats data');
          const response = await axios.get(`/api/sessions/${sessionId}/seats`);
          seatsData = response.data;
        }
        
        // Process seats data to add hasTicket property
        const processedSeats = seatsData.map((seat: Seat) => ({
          ...seat,
          hasTicket: !!seat.ticket,
          customerName: seat.ticket?.customerName || null,
          customerPhone: seat.ticket?.customerPhone || null
        }));
        
        setSeats(processedSeats);
        console.log('Loaded seats:', processedSeats.length);
      } catch (error) {
        console.error('Error fetching seats:', error);
        setError('Failed to load seats data');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
    fetchSeats();
  }, [sessionId]);

  const handleGenerateSeats = async () => {
    try {
      setLoading(true);
      await axios.post(`/api/admin/session-seats/${sessionId}/generate`);
      // Refresh seats after generation
      const response = await axios.get(`/api/admin/session-seats/${sessionId}`);
      setSeats(response.data);
      setError(null);
    } catch (error) {
      console.error('Error generating seats:', error);
      setError('Failed to generate seats');
    } finally {
      setLoading(false);
    }
  };

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

  if (status === 'loading' || loading) {
    return <AdminLayout title="Loading...">Loading seats data...</AdminLayout>;
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <AdminLayout title={`Seats for ${sessionData?.movie?.title || 'Session'}`}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.sessionInfo}>
        <h2>Session Details</h2>
        {sessionData ? (
          <div>
            <p><strong>Movie:</strong> {sessionData.movie.title}</p>
            <p><strong>Start Time:</strong> {new Date(sessionData.startTime).toLocaleString()}</p>
            <p><strong>Session ID:</strong> {sessionData.id}</p>
          </div>
        ) : (
          <p>Loading session details...</p>
        )}
      </div>

      <div className={styles.seatsContainer}>
        <div className={styles.controls}>
          <h2>Session Seats</h2>
          {seats.length === 0 && (
            <button onClick={handleGenerateSeats} className={styles.addButton}>
              Generate Seats
            </button>
          )}
          <p>Total seats: {seats.length}</p>
          <p>Reserved seats: {seats.filter(seat => seat.isReserved || seat.hasTicket).length}</p>
        </div>

        {seats.length > 0 ? (
          <div className={styles.seatsGrid}>
            <div className={styles.screen}>SCREEN</div>
            
            {rowNumbers.map(rowNumber => (
              <div key={rowNumber} className={styles.row}>
                <div className={styles.rowNumber}>Row {rowNumber}</div>
                <div className={styles.seats}>
                  {getSeatsForRow(rowNumber).map(seat => (
                    <div
                      key={seat.id}
                      className={`${styles.seat} ${getSeatStatusClass(seat)}`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seat.seat}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.availableSeat}`}></div>
                <span>Available</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.reservedSeat}`}></div>
                <span>Reserved</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendIndicator} ${styles.soldSeat}`}></div>
                <span>Sold</span>
              </div>
            </div>
          </div>
        ) : (
          <p>No seats found for this session.</p>
        )}
      </div>

      {isModalOpen && selectedSeat && (
        <div className={styles.seatDetailsModal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Seat Details</h3>
            <p><strong>Row:</strong> {selectedSeat.row}</p>
            <p><strong>Seat:</strong> {selectedSeat.seat}</p>
            <p><strong>Status:</strong> {
              selectedSeat.hasTicket 
                ? 'Sold' 
                : selectedSeat.isReserved 
                  ? 'Reserved' 
                  : 'Available'
            }</p>
            
            {selectedSeat.hasTicket && (
              <>
                <h4>Customer Information</h4>
                {selectedSeat.customerName && selectedSeat.customerPhone ? (
                  <>
                    <p><strong>Name:</strong> {selectedSeat.customerName}</p>
                    <p><strong>Phone:</strong> {selectedSeat.customerPhone}</p>
                  </>
                ) : (
                  <p>No customer information available.</p>
                )}
              </>
            )}
            
            <button 
              onClick={closeModal}
              className={styles.cancelButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className={styles.backLinks}>
        <Link href={`/admin/sessions`} className={styles.cancelButton}>
          Back to Sessions
        </Link>
        <Link href="/admin" className={styles.cancelButton}>
          Back to Admin
        </Link>
      </div>
    </AdminLayout>
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