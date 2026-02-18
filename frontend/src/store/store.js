// Redux store setup for cart + auth state.
import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";

export const store = configureStore({
    reducer: {
        // Customer cart state.
        cart: cartReducer,
        // Authentication/session state.
        auth: authReducer,
    },
});
