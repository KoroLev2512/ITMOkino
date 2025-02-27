import React from 'react';
import {SeatSelect} from '@/widgets/seatSelect';
import {Header} from "@/widgets/header";
import {InfoTable, InfoTableData} from "@/widgets/infoTable";
import styles from './tickets.styles.module.scss';


const TicketPage: React.FC = () => {
    const infoData: InfoTableData[] = [
        {
            label: 'Ваш выбор',
            value: 'Ряд 1, Место 1'
        }
    ];

    return (
        <div className={styles.wrapper}>
            <Header title={'Выбор места'}/>
            <SeatSelect/>
            <div className={styles.content}><InfoTable data={infoData}/></div>
        </div>
    );
};

export default TicketPage;