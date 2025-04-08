export interface Seat {
    row: number;
    seat: number;
    seatId?: number;
}

export interface BuySeatsFromServer {
    id: number;
    buy_seats: Seat[];
}