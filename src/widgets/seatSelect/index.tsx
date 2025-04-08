import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import style from './styles.module.scss';
import { addSeat, removeSeat } from '@/shared/store/slices/orderSlice';

interface SeatProps {
    id?: number;
    row: number;
    seat: number;
    isSelected: boolean;
    isReserved: boolean;
    onSelect: (row: number, seat: number, id?: number) => void;
}

interface Seat {
    id: number;
    row: number;
    seat: number;
    sessionId: number;
    isReserved: boolean;
    ticket: any | null;
}

interface SeatSelectProps {
    sessionId: string | string[] | undefined;
    availableSeats?: Seat[];
    allSeats?: Seat[];
}

const Seat: React.FC<SeatProps> = ({ id, row, seat, isSelected, isReserved, onSelect }) => {
    return (
        <div
            className={[
                style.seat,
                isReserved ? style.reserved : '',
                isSelected ? style.selected : '',
            ].join(' ')}
            onClick={() => {
                if (!isReserved) {
                    onSelect(row, seat, id);
                }
            }}
            title={isReserved ? 'Место забронировано' : `Ряд ${row}, Место ${seat}`}
        >
            {seat}
        </div>
    );
};

export const SeatSelect: React.FC<SeatSelectProps> = ({ sessionId, availableSeats, allSeats }) => {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<{ row: number; seat: number; id?: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    const mountedRef = useRef(true);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Load seats data
    useEffect(() => {
        const loadSeats = async () => {
            if (!sessionId) return;

            try {
                setLoading(true);

                // If all seats are provided via props, use them
                if (allSeats && allSeats.length > 0) {
                    if (mountedRef.current) {
                        setSeats(allSeats);
                        setLoading(false);
                    }
                    return;
                }

                // Fallback to available seats if provided
                if (availableSeats && availableSeats.length > 0) {
                    if (mountedRef.current) {
                        setSeats(availableSeats);
                        setLoading(false);
                    }
                    return;
                }

                // Otherwise, fetch seats from the API
                const response = await axios.get(`/api/sessions/${sessionId}`);
                if (response.data && response.data.seats && mountedRef.current) {
                    setSeats(response.data.seats);
                }
            } catch (error) {
                console.error('Error loading seats:', error);
            } finally {
                if (mountedRef.current) {
                    setLoading(false);
                }
            }
        };

        loadSeats();
    }, [sessionId, availableSeats, allSeats]);

    const handleSeatSelect = (row: number, seat: number, id?: number) => {
        if (selectedSeat && selectedSeat.row === row && selectedSeat.seat === seat) {
            // Deselect current seat
            setSelectedSeat(null);
            dispatch(removeSeat({ row, seat }));
        } else {
            // Select new seat, first deselect any current seat
            if (selectedSeat) {
                dispatch(removeSeat({ row: selectedSeat.row, seat: selectedSeat.seat }));
            }

            setSelectedSeat({ row, seat, id });
            dispatch(addSeat({ row, seat, seatId: id}));
        }
    };

    // Get unique row numbers from seats array
    const rowNumbers = [...new Set(seats.map(seat => seat.row))].sort((a, b) => a - b);

    if (loading) {
        return <div className={style.loading}>Загрузка схемы зала...</div>;
    }

    return (
        <div className={style.container}>
            <div className={style.title}>Выберите место</div>
            <div className={style.screen}>Экран</div>
            <div className={style.hall}>
                {rowNumbers.map(rowNum => (
                    <div key={`row-${rowNum}`} className={style.row}>
                        <div className={style.rowNumber}>Ряд {rowNum}</div>
                        <div className={style.seats}>
                            {seats
                                .filter(seat => seat.row === rowNum)
                                .sort((a, b) => a.seat - b.seat)
                                .map(seat => (
                                    <Seat
                                        key={`seat-${seat.id}`}
                                        id={seat.id}
                                        row={seat.row}
                                        seat={seat.seat}
                                        isSelected={
                                            !!selectedSeat &&
                                            selectedSeat.row === seat.row &&
                                            selectedSeat.seat === seat.seat
                                        }
                                        isReserved={seat.isReserved || !!seat.ticket}
                                        onSelect={handleSeatSelect}
                                    />
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className={style.legend}>
                <div className={style.legendTitle}>Статус мест:</div>
                <div className={style.legendItems}>
                    <div className={style.legendItem}>
                        <div className={style.seatSample}></div>
                        <span>Свободно</span>
                    </div>
                    <div className={style.legendItem}>
                        <div className={`${style.seatSample} ${style.reserved}`}></div>
                        <span>Забронировано</span>
                    </div>
                    <div className={style.legendItem}>
                        <div className={`${style.seatSample} ${style.selected}`}></div>
                        <span>Выбрано вами</span>
                    </div>
                </div>
            </div>
        </div>
    );
};