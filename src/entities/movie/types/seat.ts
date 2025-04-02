export interface Seat {
    seatId: number;
    row: number;
    seat: number;
}

export interface BuySeatsFromServer {
    id: number;
    buy_seats: Seat[];
}