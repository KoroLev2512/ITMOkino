import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { ROLES } from '../../types/userState';

// Define the user state type
interface User {
	id?: number;
	username?: string;
	isAdmin?: boolean;
	roles?: Array<{ id: number; value: string; description: string }>;
}

interface UserState {
	user: User | null;
	isLoading: boolean;
	error: string | null;
}

// Initial state
const initialState: UserState = {
	user: null,
	isLoading: false,
	error: null
};

// Async thunks
export const getUser = createAsyncThunk(
	'user/getUser',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get('/api/user');
			return response.data;
		} catch (error: any) {
			if (error.response && error.response.status === 404) {
				return { roles: [{ id: 0, value: ROLES.GUEST, description: "Guest user" }] };
			}
			return rejectWithValue(error.response?.data || 'Failed to fetch user');
		}
	}
);

export const editUser = createAsyncThunk(
	'user/editUser',
	async (userData: Partial<User>, { dispatch, rejectWithValue }) => {
		try {
			const response = await axios.put('/api/user', userData);
			dispatch(getUser());
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.response?.data || 'Failed to update user');
		}
	}
);

// User slice
const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		clearUser: (state) => {
			state.user = null;
			state.error = null;
		}
	},
	extraReducers: (builder) => {
		builder
			.addCase(getUser.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(getUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.user = action.payload;
				state.error = null;
			})
			.addCase(getUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			})
			.addCase(editUser.pending, (state) => {
				state.isLoading = true;
				state.error = null;
			})
			.addCase(editUser.fulfilled, (state) => {
				state.isLoading = false;
			})
			.addCase(editUser.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload as string;
			});
	}
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
