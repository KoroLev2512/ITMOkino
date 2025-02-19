import React from 'react';
import { Header } from "@/widgets/header";
import type { Movie } from "@/entities/movie";
import styles from './movie.styles.module.scss';
import classNames from 'classnames';

const data: Movie = {
    id: 1,
    title: "Кофе",
    description: "Фильм про кофе",
    image: "/images/kino.jpg",
    times: ['12:00', '14:00', '16:00'],
    genre: "комедия"
};

const Movie = () => {
    const renderSessionTimes = (times: string[]) => {
        return times.map((time) => {
            const classes = classNames(styles.sessionTimeItem);
            return <div key={time} className={classes}>{time}</div>;
        });
    };

    return (
        <div className={styles.wrapper}>
            <Header title={'Название фильма'} />
            <div className={styles.content}>
                <div className={styles.leftColumn}>
                    <div className={styles.image}>
                        <img src={data.image} alt={data.title} />
                    </div>
                    <div className={styles.description}>
                        {data.description}
                    </div>
                </div>
                <div className={styles.rightColumn}>
                    <div className={styles.info}>
                        <div className={styles.infoLabel}>Премьера</div>
                        <div className={styles.infoValue}>27 марта</div>
                        <div className={styles.infoLabel}>В ролях</div>
                        <div className={styles.infoValue}>Игорь Гомжин, и все его альтер эго</div>
                    </div>
                    <div className={styles.session}>
                        <h3 className={styles.subtitle}>Сеансы</h3>
                        <div className={styles.sessionTimesList}>
                            {renderSessionTimes(data.times)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Movie;