// Cart slice with add/remove and quantity controls.
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart(state, action) {
            // If item exists, increment quantity; otherwise add new entry.
            const item = action.payload;
            const existing = state.items.find(i => i.id === item.id)
            if (existing) {
                existing.qty += 1;
            }
            else {
                state.items.push({ ...item, qty: 1 });

            }

        },

        removeCart(state, action) {
            state.items = state.items.filter(i => i.id !== action.payload);
        },

        increaseQty(state, action) {
            const item = state.items.find(i => i.id === action.payload);
            if (item) {
                item.qty += 1;
            }
        },

        decreaseQty(state, action) {
            const itemIndex = state.items.findIndex(
                i => i.id === action.payload
            );

            if (itemIndex !== -1) {
                if (state.items[itemIndex].qty > 1) {
                    state.items[itemIndex].qty -= 1;

                }
                else {

                    state.items.splice(itemIndex, 1);
                }
            }
        },

        clearCart(state) {
            state.items = [];
        }

    }
});

export const {
    addToCart,
    removeCart,
    increaseQty,
    decreaseQty,
    clearCart,

} = cartSlice.actions;

export default cartSlice.reducer;
