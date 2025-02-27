import React from 'react';
import { InfoTableData } from './types';
import styles from './styles.module.scss';

interface InfoTableProps {
    data: InfoTableData[];
}

export const InfoTable = ({ data }: InfoTableProps) => {
    const renderItems = (data: InfoTableData[]) => {
        return data.map((item, index) => (
            <React.Fragment key={index}>
                <div className={styles.info}>
                    <div className={styles.infoLabel}>{item.label}</div>
                    <div className={styles.value}>{item.value}</div>
                </div>
            </React.Fragment>
        ));
    };
    return (
        <div className={styles.InfoTable}>{renderItems(data)}</div>
    );
};
