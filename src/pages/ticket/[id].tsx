import React from 'react';
import {SeatSelect} from '@/widgets/seatSelect';
import {Header} from "@/widgets/header";
import {InfoTable} from "@/widgets/infoTable";
import {useSelector} from "react-redux";
import {RootState} from "@/shared/store";
import styles from './tickets.styles.module.scss';
import {OrderState} from "@/shared/store/slices";


const TicketPage: React.FC = () => {
    const { order } = useSelector((state: RootState) => state);
    const getOrderInfo = (order: OrderState) => {
        return order.seats.map((seat) => ({
            label: `Вы выбрали`,
            value: `Ряд ${seat.row}, Место ${seat.seat}`
        }));
    }

    return (
        <div className={styles.wrapper}>
            <Header title={'Выбор места'}/>
            <SeatSelect/>
            <div className={styles.content}><InfoTable data={getOrderInfo(order)}/></div>
        </div>
    );
};

export default TicketPage;