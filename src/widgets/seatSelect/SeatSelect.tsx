import React from 'react';
import classNames from 'classnames';
import {Seat} from '@/widgets/seatSelect/seat';
import styles from './styles.module.scss';

export const SeatSelect = () => {
    let seat = 1;
    let row = 1;
    let resetNums = [34, 34, 34, 34, 34, 34, 28, 28, 28, 28, 28, 28, 28, 28];
    const emptyCells = [204, 205, 206, 235, 236, 237, 238, 239, 240, 269, 270, 271, 272, 273, 274, 303, 304, 305, 306, 307, 308, 337, 338, 339, 340, 341, 342, 371, 372, 373, 374, 375, 376, 405, 406, 407, 408, 409, 410, 439, 440, 441, 442, 443, 444, 473, 474, 475];

    return (
        <div className={styles.seatsSelect}>
            <div className={styles.screen}>
                <i className="ic-screen"></i>
                <span>Экран</span>
            </div>

            <div className={styles.place}>
                <div className={styles.rows}>
                    {Array(14).fill(0).map((item, i) => (
                        <div key={`row-${i}`} className={styles.row}>{i + 1}</div>
                    ))}
                </div>
                <div className={styles.seats}>
                    {Array(475).fill(0).map((item, i) => {
                        if (emptyCells.includes(i)) {
                            return <div key={`null-${i}`} />
                        } else {
                            const classes = classNames('ic-seat', {
                                [styles.available]: seat !== 3 && seat !== 5,
                                [styles.busy]: seat === 3,
                                [styles.selected]: seat === 5,
                            })
                            const data = {
                                id: seat,
                                row,
                                seat,
                                status: seat !== 0 ? 'available' : 'busy',
                            }
                            if (seat === resetNums[row - 1] || seat === 34) {
                                seat = 1
                                row++
                                data.row = row
                            } else {
                                seat++
                            }
                            return <Seat key={`${row}-${seat}`} className={classes} data={data} />;
                        }
                    })}
                </div>
            </div>

            <div className={styles.info}>
                <div className={classNames(styles.infoItem, styles.available)}>
                    <i className="ic-dot"/>
                    <span>Свободно</span>
                </div>
                <div className={classNames(styles.infoItem, styles.busy)}>
                    <i className="ic-dot busy"/>
                    <span>Занято</span>
                </div>
                <div className={classNames(styles.infoItem, styles.selected)}>
                    <i className="ic-dot selected"/>
                    <span>Выбрано</span>
                </div>
            </div>
        </div>
    );
};
