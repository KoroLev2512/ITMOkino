import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Seat} from "@/entities/movie/types/seat";

export interface OrderState {
    seats: Seat[];
}

const initialState: OrderState = {
    seats: []
}

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        addSeat(state, action: PayloadAction<Seat>) {
            console.log('Redux: Adding seat to order', action.payload);
            state.seats = [action.payload];
        },
        removeSeat(state, action: PayloadAction<Seat>) {
            console.log('Redux: Removing seat from order', action.payload);
            const {row, seat} = action.payload;
            state.seats = state.seats.filter((data) => data.seat !== seat && data.row !== row);
        },
        clearOrder(state) {
            console.log('Redux: Clearing order');
            state.seats = [];
        }
    }
});

export const { addSeat, removeSeat, clearOrder } = orderSlice.actions;
export default orderSlice.reducer;