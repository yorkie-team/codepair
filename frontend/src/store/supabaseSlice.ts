import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../types/supabase";

export interface SupabaseState {
	client: SupabaseClient<Database, "public"> | null;
}

const initialState: SupabaseState = {
	client: null,
};

export const supabaseSlice = createSlice({
	name: "supabase",
	initialState,
	reducers: {
		setClient: (state, action: PayloadAction<SupabaseClient<Database, "public"> | null>) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			state.client = action.payload as any;
		},
	},
});

export const { setClient } = supabaseSlice.actions;

export const selectSupabase = (state: RootState) => state.supabase;

export default supabaseSlice.reducer;
