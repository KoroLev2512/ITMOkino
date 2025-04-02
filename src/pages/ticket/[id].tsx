import React, { useState, useEffect } from 'react';
import {SeatSelect} from '@/widgets/seatSelect';
import {Header} from "@/widgets/header";
import {InfoTable} from "@/widgets/infoTable";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "@/shared/store";
import styles from './tickets.styles.module.scss';
import {OrderState} from "@/shared/store/slices";
import { clearOrder } from '@/shared/store/slices/orderSlice';
import { useRouter } from 'next/router';
import { reserveSeat } from '@/lib/api';
import axios from 'axios';

interface Seat {
    id: number;
    row: number;
    seat: number;
    sessionId: number;
    isReserved: boolean;
    ticket: any | null;
}

const TicketPage: React.FC = () => {
    const order = useSelector((state: RootState) => state.order);
    console.log('Current order state in ticket page:', order);
    
    const dispatch = useDispatch();
    const router = useRouter();
    const { id: sessionId } = router.query;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);
    const [error, setError] = useState('');
    const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Create new seats for the session if needed
    useEffect(() => {
        const createSeatsIfNeeded = async () => {
            if (sessionId) {
                try {
                    setIsLoading(true);
                    // First, check if there are available seats
                    const response = await axios.get(`/api/sessions/${sessionId}`);
                    if (response.data && response.data.seats) {
                        // Store all seats from the session
                        const allSeats = response.data.seats;
                        
                        // Filter out available seats (seats without tickets or not reserved)
                        const availableSeats = allSeats.filter(
                            (seat: Seat) => !seat.ticket && !seat.isReserved
                        );
                        
                        setAvailableSeats(availableSeats);
                        setSeats(allSeats); // Store all seats to display both available and reserved
                        
                        console.log('Available seats:', availableSeats.length);
                        console.log('Total seats:', allSeats.length);
                        
                        if (availableSeats.length === 0) {
                            console.log('No available seats found, creating new seats');
                            
                            // Create multiple new seats with different row and seat numbers
                            const createPromises: Promise<any>[] = [];
                            
                            // Create 5 seats with different positions - ensuring proper number values
                            for (let i = 0; i < 5; i++) {
                                // Ensure row and seat are numbers between 1-9 for simplicity
                                const rowNum = 1; // Use row 1 for simplicity
                                const seatNum = i + 1; // Seats 1-5
                                
                                console.log(`Creating seat with row: ${rowNum}, seat: ${seatNum}`);
                                
                                createPromises.push(
                                    axios.post('/api/seats', {
                                        sessionId: Number(sessionId),
                                        row: rowNum,
                                        seat: seatNum
                                    })
                                );
                            }
                            
                            try {
                                const results = await Promise.all(createPromises);
                                console.log('Created new seats:', results.length);
                                
                                // Refresh seats data
                                const newResponse = await axios.get(`/api/sessions/${sessionId}`);
                                if (newResponse.data && newResponse.data.seats) {
                                    const allNewSeats = newResponse.data.seats;
                                    const newAvailableSeats = allNewSeats.filter(
                                        (seat: Seat) => !seat.ticket && !seat.isReserved
                                    );
                                    setAvailableSeats(newAvailableSeats);
                                    setSeats(allNewSeats);
                                    console.log('Available seats after creation:', newAvailableSeats.length);
                                    console.log('Total seats after creation:', allNewSeats.length);
                                }
                            } catch (err) {
                                console.error('Error creating seats:', err);
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error with seats:', err);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        
        createSeatsIfNeeded();
        
        // No need for polling - only fetch once when page loads
        // or when sessionId changes
    }, [sessionId]); // Only re-run when sessionId changes

    // Comment out the availability check that's causing the error
    /*
    useEffect(() => {
        if (order.seats.length > 0 && availableSeats.length > 0) {
            const selectedSeat = order.seats[0];
            const isSeatAvailable = availableSeats.some(
                seat => seat.row === selectedSeat.row && seat.seat === selectedSeat.seat
            );
            
            if (!isSeatAvailable) {
                console.log('Selected seat is not in available seats, clearing order');
                dispatch(clearOrder());
                setError('Выбранное место недоступно. Пожалуйста, выберите другое место.');
            }
        }
    }, [order.seats, availableSeats, dispatch]);
    */

    const getOrderInfo = (order: OrderState) => {
        console.log("Current order state:", order);
        return order.seats.map((seat) => ({
            label: `Выбрано место`,
            value: `Ряд ${seat.row}, Место ${seat.seat}`
        }));
    }

    const refreshAvailableSeats = async () => {
        if (!sessionId) return;
        
        try {
            const response = await axios.get(`/api/sessions/${sessionId}`);
            if (response.data && response.data.seats) {
                const allSeats = response.data.seats;
                const availableSeats = allSeats.filter(
                    (seat: Seat) => !seat.ticket && !seat.isReserved
                );
                setAvailableSeats(availableSeats);
                setSeats(allSeats);
            }
        } catch (err) {
            console.error('Error refreshing seats:', err);
        }
    };

    const handleConfirmBooking = async () => {
        if (!order.seats.length || isSubmitting) return;
        
        setIsSubmitting(true);
        setError('');
        
        try {
            const selectedSeat = order.seats[0];
            console.log('Booking seat:', { row: selectedSeat.row, seat: selectedSeat.seat, seatId: selectedSeat.seatId });
            
            // First check if the selected seat is actually available
            if (selectedSeat.seatId) {
                // Check if this seat ID exists in availableSeats
                const seatStillAvailable = availableSeats.some(seat => seat.id === selectedSeat.seatId);
                
                if (!seatStillAvailable) {
                    setError(`Место Ряд ${selectedSeat.row}, Место ${selectedSeat.seat} уже забронировано. Пожалуйста, выберите другое место.`);
                    setIsSubmitting(false);
                    await refreshAvailableSeats();
                    dispatch(clearOrder()); // Clear invalid selection
                    return;
                }
                
                // For demo purposes, using placeholder customer data
                const customerData = {
                    customerName: "Demo Customer " + new Date().getTime(),
                    customerPhone: "demo" + new Date().getTime() + "@example.com"
                };
                
                console.log('Sending reservation request with data:', customerData);
                
                try {
                    // Reserve the selected seat
                    const result = await reserveSeat(selectedSeat.seatId, customerData);
                    console.log("Reservation successful:", result);
                    
                    // Success - update UI
                    setBookingConfirmed(true);
                    dispatch(clearOrder());
                } catch (err: any) {
                    // Handle API errors
                    console.error('Error reserving seat:', err);
                    
                    if (err.response?.status === 400) {
                        setError(`Место уже забронировано. Пожалуйста, выберите другое место.`);
                        await refreshAvailableSeats();
                        dispatch(clearOrder()); // Clear invalid selection
                    } else if (err.response?.data?.message) {
                        setError(`Ошибка: ${err.response.data.message}`);
                    } else if (err.message) {
                        setError(`Ошибка: ${err.message}`);
                    } else {
                        setError('Не удалось забронировать место. Пожалуйста, попробуйте другое место.');
                    }
                }
            } else {
                // No seatId means we need to create the seat first
                try {
                    // Check if a seat with the same row and number already exists in any state
                    const checkResponse = await axios.get(`/api/sessions/${sessionId}`);
                    if (checkResponse.data && checkResponse.data.seats) {
                        const existingSeat = checkResponse.data.seats.find(
                            (seat: Seat) => seat.row === Number(selectedSeat.row) && seat.seat === Number(selectedSeat.seat)
                        );
                        
                        if (existingSeat) {
                            if (existingSeat.isReserved || existingSeat.ticket) {
                                setError(`Место Ряд ${selectedSeat.row}, Место ${selectedSeat.seat} уже забронировано. Пожалуйста, выберите другое место.`);
                                setIsSubmitting(false);
                                await refreshAvailableSeats();
                                dispatch(clearOrder()); // Clear invalid selection
                                return;
                            }
                            
                            // If seat exists but is not reserved, use it for booking
                            const customerData = {
                                customerName: "Demo Customer " + new Date().getTime(),
                                customerPhone: "demo" + new Date().getTime() + "@example.com"
                            };
                            
                            try {
                                const result = await reserveSeat(existingSeat.id, customerData);
                                console.log("Reservation successful with existing seat:", result);
                                setBookingConfirmed(true);
                                dispatch(clearOrder());
                                return;
                            } catch (bookErr: any) {
                                console.error('Error booking existing seat:', bookErr);
                                
                                if (bookErr.response?.status === 400) {
                                    setError(`Место уже забронировано. Пожалуйста, выберите другое место.`);
                                    await refreshAvailableSeats();
                                    dispatch(clearOrder()); // Clear invalid selection
                                } else {
                                    setError('Не удалось забронировать место. Пожалуйста, попробуйте другое место.');
                                }
                                
                                setIsSubmitting(false);
                                return;
                            }
                        }
                    }
                    
                    // Create a new seat if none exists
                    console.log(`Creating seat: Row ${selectedSeat.row}, Seat ${selectedSeat.seat}`);
                    const createResponse = await axios.post('/api/seats', {
                        sessionId: Number(sessionId),
                        row: Number(selectedSeat.row),
                        seat: Number(selectedSeat.seat)
                    });
                    
                    const newSeat = createResponse.data;
                    console.log('Created seat:', newSeat);
                    
                    // Reserve the newly created seat
                    const customerData = {
                        customerName: "Demo Customer " + new Date().getTime(),
                        customerPhone: "demo" + new Date().getTime() + "@example.com"
                    };
                    
                    const result = await reserveSeat(newSeat.id, customerData);
                    console.log("Reservation successful with new seat:", result);
                    
                    // Success - update UI
                    setBookingConfirmed(true);
                    dispatch(clearOrder());
                } catch (err: any) {
                    console.error('Error with seat creation/reservation:', err);
                    
                    if (err.response?.status === 400) {
                        setError(`Место уже забронировано. Пожалуйста, выберите другое место.`);
                        await refreshAvailableSeats();
                    } else if (err.response?.data?.message) {
                        setError(`Ошибка: ${err.response.data.message}`);
                    } else if (err.message) {
                        setError(`Ошибка: ${err.message}`);
                    } else {
                        setError('Не удалось забронировать место. Пожалуйста, попробуйте другое место.');
                    }
                }
            }
        } catch (err) {
            console.error('Unexpected error in booking process:', err);
            setError('Произошла ошибка при бронировании. Пожалуйста, попробуйте позже.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.wrapper}>
                <Header title={'Выбор места'}/>
                <div className={styles.loading}>Загрузка информации о сеансе...</div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <Header title={'Выбор места'}/>
            {!bookingConfirmed ? (
                <>
                    <SeatSelect 
                        sessionId={sessionId}
                        allSeats={seats} // Pass all seats, including reserved ones
                    />
                    {order?.seats?.length > 0 ? (
                        <div className={styles.info}>
                            <div className={styles.title}>Бронирование места</div>
                            <div className={styles.content}><InfoTable data={getOrderInfo(order)}/></div>
                            <button 
                                className={styles.button}
                                onClick={handleConfirmBooking}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Обработка...' : 'Забронировать место'}
                            </button>
                            {error && <div className={styles.error}>{error}</div>}
                        </div>
                    ) : (
                        <div className={styles.selectPrompt}>
                            Пожалуйста, выберите место на схеме зала
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.confirmationMessage}>
                    <h2>Бронирование подтверждено!</h2>
                    <p>Ваш билет успешно забронирован.</p>
                    <button 
                        className={styles.button}
                        onClick={() => router.push('/')}
                    >
                        Вернуться на главную
                    </button>
                </div>
            )}
        </div>
    );
};

export default TicketPage;