import React from 'react';
import {SeatSelect} from '@/widgets/seatSelect';
import {Header} from "@/widgets/header";
import styles from './tickets.styles.module.scss';


const TicketPage: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <Header title={'Выбор места'}/>
            <SeatSelect/>
        </div>
    );
};

export default TicketPage;