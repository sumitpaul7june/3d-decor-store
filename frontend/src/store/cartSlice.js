// Cart slice with add/remove and quantity controls.
import { createSlice } from "@reduxjs/toolkit";

const MAX_CART_ITEM_QUANTITY = 10;

const initialState = {
    // Unified cart item shape: { id, name, price, originalPrice, type, image, qty }
    items: [],
}

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {

        setCartFromServer(state, action) {
            // Replace local cart with normalized server cart.
            state.items = (action.payload || []).map((item) => ({
                ...item,
                qty: Math.min(Number(item.qty || 1), MAX_CART_ITEM_QUANTITY)
            }));

        },
        addToCart(state, action) {
            // If item exists, increment quantity; otherwise add new entry.
            const item = action.payload;
            const quantityToAdd = Math.min(Number(item.qty || 1), MAX_CART_ITEM_QUANTITY);
            const existing = state.items.find(i => i.id === item.id)
            if (existing) {
                existing.qty = Math.min(existing.qty + quantityToAdd, MAX_CART_ITEM_QUANTITY);
            }
            else {
                state.items.push({ ...item, qty: quantityToAdd });

            }

        },

        removeCart(state, action) {
            // Remove one cart line completely by product id.
            state.items = state.items.filter(i => i.id !== action.payload);
        },

        increaseQty(state, action) {
            // Increase quantity of one item by id.
            const item = state.items.find(i => i.id === action.payload);
            if (item && item.qty < MAX_CART_ITEM_QUANTITY) {
                item.qty += 1;
            }
        },

        decreaseQty(state, action) {
            // Decrease quantity; remove item if it reaches 0.
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
            // Used after logout/order success.
            state.items = [];
        }

    }
});

export const {
    setCartFromServer,
    addToCart,
    removeCart,
    increaseQty,
    decreaseQty,
    clearCart,

} = cartSlice.actions;

export default cartSlice.reducer;
