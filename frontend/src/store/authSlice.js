import { createSlice } from "@reduxjs/toolkit";

let persistedAuth = null;

try {
    persistedAuth = JSON.parse(localStorage.getItem("auth"));
} catch {
    persistedAuth = null;
}

const defaultState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
};

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
