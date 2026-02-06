import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice"; // ✅ MUST exist

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer, // ✅ MUST be here
    },
});

