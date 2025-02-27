import { Movie } from "@/entities/movie";

export const helpers = {
    getInfoData: (data: Movie) => [
        {
            label: 'В ролях',
            value: data.actors?.join(', ') || '',
        },
    ]
}
