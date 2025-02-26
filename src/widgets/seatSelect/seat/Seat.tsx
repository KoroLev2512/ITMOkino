import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import classNames from 'classnames';
import {addSeat, clearOrder, deleteSeat} from '@/shared/store/slices/orderSlice';
import styles from './styles.module.scss';
import {RootState} from "@/shared/store";

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
    const selectedSeat = useSelector((state: RootState) => state.order.seats[0]);

    useEffect(() => {
        if (selectedSeat === id) {
            setStatus('selected');
        } else if (status === 'selected') {
            setStatus('available');
        }
    }, [selectedSeat, id, status]);

    const onClick = () => {
        if (initStatus !== 'busy') {
            const isSelected = status === 'available';
            const newStatus = isSelected ? 'selected' : 'available';
            setStatus(newStatus)

            if (isSelected) {
                dispatch(clearOrder());
                dispatch(addSeat(id));
            } else {
                dispatch(clearOrder());
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
