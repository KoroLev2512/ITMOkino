import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Seat} from "@/shared/types/seat";

interface OrderState {
    seats: Seat[];
}

const initialState: OrderState = {
    seats: []
}

const orderSlice = createSlice({
    name: 'orderSlice',
    initialState,
    reducers: {
        addSeat(state, action: PayloadAction<Seat>) {
            state.seats = [action.payload];
        },
        deleteSeat(state, action: PayloadAction<Seat>) {
            const {row, seat} = action.payload;
            state.seats = state.seats.filter((data) => data.seat !== seat && data.row !== row);
        },
        clearOrder(state) {
            state.seats = [];
        }
    }
})

export const orderReducer = orderSlice.reducer;
export const { addSeat, deleteSeat, clearOrder } = orderSlice.actions;