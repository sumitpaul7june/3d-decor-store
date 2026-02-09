// Auth slice with localStorage persistence for login state.
import { createSlice } from "@reduxjs/toolkit";

// Attempt to load persisted auth state from localStorage.
let persistedAuth = null;

try {
    persistedAuth = JSON.parse(localStorage.getItem("auth"));
} catch {
    persistedAuth = null;
}

// Base auth state.
const defaultState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
};

// Merge persisted data over defaults if available.
const initialState = persistedAuth
    ? { ...defaultState, ...persistedAuth }
    : defaultState;

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginStart(state) {
            state.loading = true;
            state.error = null;
        },

        loginSuccess(state, action) {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;

            // Persist auth state for refresh support.
            localStorage.setItem(
                "auth",
                JSON.stringify({
                    isAuthenticated: true,
                    user: action.payload,
                })
            );
        },

        loginFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },

        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            // Clear persisted auth on logout.
            localStorage.removeItem("auth");
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
} = authSlice.actions;

export default authSlice.reducer;
