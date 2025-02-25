import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderState {
    seats: number[];
}

const initialState: OrderState = {
    seats: []
}

const orderSlice = createSlice({
    name: 'orderSlice',
    initialState,
    reducers: {
        addSeat(state, action: PayloadAction<number>) {
            state.seats = [action.payload];
        },
        deleteSeat(state, action: PayloadAction<number>) {
            state.seats = state.seats.filter(seat => seat !== action.payload);
        },
        clearOrder(state) {
            state.seats = [];
        }
    }
})

export const orderReducer = orderSlice.reducer;
export const { addSeat, deleteSeat, clearOrder } = orderSlice.actions;