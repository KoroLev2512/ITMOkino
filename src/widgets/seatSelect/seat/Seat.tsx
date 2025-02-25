import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';
import { addSeat, deleteSeat } from '@/shared/store/slices/orderSlice';
import styles from './styles.module.scss';

interface SeatProps {
    className: string;
    data: {
        id: number;
        num: number;
        status: string;
    };
}

export const Seat = ({ data }: SeatProps) => {
    const { id, status: initStatus, num } = data;
    const [status, setStatus] = useState(initStatus);
    const classes = classNames(styles.seat, styles[status]);
    const dispatch = useDispatch();

    const onClick = () => {
        if (initStatus !== 'busy') {
            const isSelected = status === 'available';
            const newStatus = isSelected ? 'selected' : 'available';
            setStatus(newStatus)

            if (isSelected) {
                dispatch(addSeat(id));
            } else {
                dispatch(deleteSeat(id));
            }
        }
    }

    return (
        <div className={classes} onClick={onClick}>
            <i className="ic-seat" />
            <span className={styles.seatNum}>{num}</span>
        </div>
    );
};