import { Movie } from "@/entities/movie";

export interface MovieInfo {
    id: number;
    image?: string;
    title: string;
    description: string;
    genre?: string;
    actors?: string[] | string;
    duration?: number;
    year?: number;
}

// Define an info item type
export interface InfoItem {
    label: string;
    value: string;
}

export const helpers: {
    getInfoData: (data: MovieInfo) => InfoItem[];
} = {
    getInfoData: (data: MovieInfo) => {
        // Create info list
        const infoList: InfoItem[] = [];
        
        // Handle actors (could be string or string[])
        if (data.actors) {
            let actorsValue = '';
            if (Array.isArray(data.actors)) {
                actorsValue = data.actors.join(', ');
            } else if (typeof data.actors === 'string') {
                actorsValue = data.actors;
            }
            
            infoList.push({
                label: 'В ролях',
                value: actorsValue,
            });
        }
        
        // Add genre if available
        if (data.genre) {
            infoList.push({
                label: 'Жанр',
                value: data.genre,
            });
        }
        
        // Add year if available
        if (data.year) {
            infoList.push({
                label: 'Год',
                value: data.year.toString(),
            });
        }
        
        // Add duration if available
        if (data.duration) {
            infoList.push({
                label: 'Длительность',
                value: `${data.duration} мин.`,
            });
        }
        
        return infoList;
    },
};