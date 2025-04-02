import {Text} from "@/shared/ui/Text";
import {MovieList} from "@/widgets/card";
import styles from './home.styles.module.scss';

export const HomePage = () => {
    return (
        <div className={styles.wrapper}>
            <Text center className={styles.title}>
                Welcome to itmokino
            </Text>
            <MovieList/>
        </div>
    );
};


export default HomePage;
