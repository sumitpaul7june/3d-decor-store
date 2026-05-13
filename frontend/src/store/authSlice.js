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
            // Start loading state before login/register API call.
            state.loading = true;
            state.error = null;
        },

        loginSuccess(state, action) {
            // Save authenticated user in Redux.
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;

            // Persist ONLY necessary fields in local storage to minimize security footprint.
            const { _id, name, email, role, googleId } = action.payload || {};
            localStorage.setItem(
                "auth",
                JSON.stringify({
                    isAuthenticated: true,
                    user: { _id, name, email, role, googleId },
                })
            );
        },

        loginFailure(state, action) {
            // Stop loading and keep backend/frontend error message.
            state.loading = false;
            state.error = action.payload;
        },

        logout(state) {
            // Reset auth state to logged-out defaults.
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
