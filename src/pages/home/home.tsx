import styles from './home.styles.module.scss';

export const HomePage = () => {
    return (
        <div className={styles.wrapper}>
            <Text center children={"Welcome to itmokino"} className={styles.title}/>
            <MovieList/>
        </div>
    );
};


export default HomePage;
