import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {addSeat, clearOrder, deleteSeat} from '@/shared/store/slices/orderSlice';
import {RootState} from "@/shared/store";
import styles from './styles.module.scss';

interface SeatProps {
    data: {
        row: number;
        seat: number;
        status: string;
    };
}

export const Seat = ({ data }: SeatProps) => {
    const { row, seat, status: initStatus } = data;
    const [status, setStatus] = useState(initStatus);
    const classes = classNames(styles.seat, styles[status]);
    const dispatch = useDispatch();
    const selectedSeat = useSelector((state: RootState) => state.order.seats[0]);

    useEffect(() => {
        if (selectedSeat && selectedSeat.row === row && selectedSeat.seat === seat) {
            setStatus('selected');
        } else if (status === 'selected') {
            setStatus('available');
        }
    }, [selectedSeat, row, seat, status]);

    const onClick = () => {
        if (initStatus !== 'busy') {
            const isSelected = status === 'available';
            const newStatus = isSelected ? 'selected' : 'available';
            setStatus(newStatus)

            if (isSelected) {
                dispatch(clearOrder());
                dispatch(addSeat({row, seat}));
            } else {
                dispatch(clearOrder());
                dispatch(deleteSeat({row, seat}));
            }
        }
    }

    return (
        <div className={classes} onClick={onClick}>
            <i className="ic-seat" />
            <span className={styles.seatNum}>{seat}</span>
        </div>
    );
};
