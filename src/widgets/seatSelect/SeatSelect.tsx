import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './styles.module.scss';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addSeat, clearOrder } from '@/shared/store/slices/orderSlice';

interface SeatSelectProps {
    sessionId?: string | string[];
}

interface DBSeat {
    id: number;
    row: number;
    seat: number;
    isReserved: boolean;
    ticket?: any;
}

// Fixed layout configuration
const TOTAL_ROWS = 10;
const SEATS_PER_ROW = 14;

export const SeatSelect: React.FC<SeatSelectProps> = ({ sessionId }) => {
    const [databaseSeats, setDatabaseSeats] = useState<DBSeat[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeat, setSelectedSeat] = useState<{row: number, seat: number, id?: number} | null>(null);
    const dispatch = useDispatch();

    // Load seats from API
    useEffect(() => {
        const fetchSeats = async () => {
            if (!sessionId) return;
            
            try {
                setLoading(true);
                const response = await axios.get(`/api/sessions/${sessionId}`);
                if (response.data?.seats) {
                    setDatabaseSeats(response.data.seats);
                    console.log('Loaded seats from database:', response.data.seats);
                }
            } catch (error) {
                console.error('Error loading seats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSeats();
    }, [sessionId]);

    // Check if a seat is reserved based on database data
    const isSeatReserved = (row: number, seatNum: number): boolean => {
        return databaseSeats.some(
            dbSeat => dbSeat.row === row && 
                    dbSeat.seat === seatNum && 
                    (dbSeat.isReserved || dbSeat.ticket)
        );
    };

    // Find a seat in the database
    const findSeatInDatabase = (row: number, seatNum: number): DBSeat | undefined => {
        return databaseSeats.find(
            dbSeat => dbSeat.row === row && dbSeat.seat === seatNum
        );
    };

    // Handle seat selection
    const handleSeatClick = (row: number, seatNum: number) => {
        // Check if this seat is reserved
        if (isSeatReserved(row, seatNum)) {
            console.log(`Cannot select reserved seat: Row ${row}, Seat ${seatNum}`);
            return;
        }
        
        try {
            // Find the seat ID if it exists in the database
            const dbSeat = findSeatInDatabase(row, seatNum);
            
            // If clicking the same seat, deselect it
            if (selectedSeat && selectedSeat.row === row && selectedSeat.seat === seatNum) {
                console.log(`Deselecting seat: Row ${row}, Seat ${seatNum}`);
                setSelectedSeat(null);
                dispatch(clearOrder());
            } else {
                console.log(`Selecting seat: Row ${row}, Seat ${seatNum}, DB ID: ${dbSeat?.id || 'not in database'}`);
                
                // Create the selection object
                const newSelection = {
                    row, 
                    seat: seatNum,
                    id: dbSeat?.id
                };
                
                // Update local state
                setSelectedSeat(newSelection);
                
                // Immediately update Redux store
                dispatch(clearOrder());
                
                // Create seat data for Redux
                const seatData = {
                    row: Number(row),
                    seat: Number(seatNum),
                    seatId: dbSeat?.id
                };
                
                // Log and dispatch
                console.log('Dispatching to Redux:', seatData);
                dispatch(addSeat(seatData));
            }
        } catch (err) {
            console.error('Error in seat selection:', err);
        }
    };

    // Add a function to refresh seats data
    const refreshSeats = async () => {
        if (!sessionId) return;
        
        try {
            setLoading(true);
            const response = await axios.get(`/api/sessions/${sessionId}`);
            if (response.data?.seats) {
                setDatabaseSeats(response.data.seats);
                console.log('Refreshed seats data from database');
            }
        } catch (error) {
            console.error('Error refreshing seats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Add useEffect to refresh seats when component is mounted or when props change
    useEffect(() => {
        // Refresh data every 5 seconds to see if seats have been booked by others
        const interval = setInterval(() => {
            refreshSeats();
        }, 5000);
        
        // Clean up interval on unmount
        return () => clearInterval(interval);
    }, [sessionId]);

    if (loading) {
        return <div className={styles.loading}>Загрузка схемы зала...</div>;
    }

    // Create array of rows
    const rows = Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1);
    
    // Create array of seats for each row
    const seatsArray = Array.from({ length: SEATS_PER_ROW }, (_, i) => i + 1);

    return (
        <div className={styles.seatsSelect}>
            <div className={styles.screen}>
                <i className="ic-screen"></i>
                <span>Экран</span>
            </div>

            <div className={styles.hallWrapper}>
                {rows.map(rowNum => (
                    <div key={`row-${rowNum}`} className={styles.rowContainer}>
                        <div className={styles.rowNumber}>{rowNum}</div>
                        <div className={styles.rowSeats}>
                            {seatsArray.map(seatNum => {
                                // Check if this seat is reserved in the database
                                const isReserved = isSeatReserved(rowNum, seatNum);
                                
                                // Check if this seat is currently selected
                                const isSelected = selectedSeat && 
                                                  selectedSeat.row === rowNum && 
                                                  selectedSeat.seat === seatNum;
                                
                                return (
                                    <div
                                        key={`seat-${rowNum}-${seatNum}`}
                                        className={classNames(styles.seat, {
                                            [styles.reserved]: isReserved,
                                            [styles.selected]: isSelected
                                        })}
                                        onClick={() => handleSeatClick(rowNum, seatNum)}
                                        title={isReserved 
                                            ? 'Место занято' 
                                            : `Ряд ${rowNum}, Место ${seatNum}`}
                                    >
                                        {seatNum}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.legend}>
                <div className={styles.legendItem}>
                    <div className={styles.seatSample}></div>
                    <span>Свободно</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.seatSample} ${styles.reserved}`}></div>
                    <span>Занято</span>
                </div>
                <div className={styles.legendItem}>
                    <div className={`${styles.seatSample} ${styles.selected}`}></div>
                    <span>Выбрано</span>
                </div>
            </div>
        </div>
    );
};
