// import { MovieList } from '../../widgets/MovieList'
// import { Text } from '../../shared/ui/Text'
import { Landing } from "@/widgets/Landing";
import styles from './home.styles.module.scss';

export const HomePage = () => {
    return (
        <div className={styles.bg}>
            <div className={styles.wrapper}>
                <Landing/>
                {/* <Text center children={"Welcome to itmokino"} className={styles.title}/> */}
                {/* <MovieList/> */}
                {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
            </div>
        </div>
    );
};


export default HomePage;

// import React from 'react';
// import {Header} from "@/widgets/header";
// import {useRouter} from "next/router";
// import classNames from 'classnames';
// import {useSelector} from "react-redux";
// import {RootState} from "@/shared/store";
// import {Movie} from "@/entities/movie";
// import {Text} from "@/shared/ui/Text";
// import styles from '@/pages/movie/movie.styles.module.scss';
// import Link from "next/link";
//
// interface MovieProps {
//     movie: Movie;
// }
//
// const MoviePage = (props: MovieProps) => {
//     const router = useRouter();
//     const {id} = router.query;
//     const movie = useSelector((state: RootState) => state.movies.data.find(movie => movie.id === Number(id)));
//     const renderSessionTimes = (times: string[]) => {
//         return times.map((time) => {
//             const classes = classNames(styles.sessionTimeItem);
//             return <div key={time} className={classes}>{time}</div>;
//         });
//     };
//
//     if (!movie) {
//         return (
//             <div className={styles.error}>
//                 <Text center className={styles.errorText}>К сожалению, этот фильм не найден</Text>
//                 <Link href={'/'}>
//                     <button className={styles.errorButton}>На главную</button>
//                 </Link>
//             </div>
//
//         );
//     }
//
//     return (
//         <div className={styles.wrapper}>
//             <Header title={movie.title}/>
//             <div className={styles.content}>
//                 <div className={styles.leftColumn}>
//                     <div className={styles.image}>
//                         <img
//                             src={movie.image}
//                             alt={movie.title}
//                         />
//                     </div>
//                     <div className={styles.description}>
//                         {movie.description}
//                     </div>
//                 </div>
//                 <div className={styles.rightColumn}>
//                     <div className={styles.info}>
//                         <div className={styles.infoLabel}>В ролях</div>
//                         <div className={styles.infoValue}>{movie.actors?.join(', ')}</div>
//                     </div>
//                     <div className={styles.session}>
//                         <h3 className={styles.subtitle}>Сеансы</h3>
//                         <Link href={'/ticket/1'} className={styles.sessionTimesList}>
//                             {renderSessionTimes(movie.times || [])}
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default MoviePage;
