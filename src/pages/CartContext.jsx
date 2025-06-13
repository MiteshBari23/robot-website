import React, { createContext, useReducer, useContext } from 'react';

// Initial state
const initialState = {
  cartItems: []
};

// Actions
const ADD_ITEM = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const CLEAR_CART = 'CLEAR_CART';

// Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case ADD_ITEM:
      const item = action.payload;
      const existing = state.cartItems.find(i => i.name === item.name);
      if (existing) {
        return {
          ...state,
          cartItems: state.cartItems.map(i =>
            i.name === item.name ? { ...i, qty: i.qty + 1 } : i
          )
        };
      }
      return {
        ...state,
        cartItems: [...state.cartItems, { ...item, qty: 1 }]
      };

    case REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems
          .map(i =>
            i.name === action.payload
              ? { ...i, qty: i.qty - 1 }
              : i
          )
          .filter(i => i.qty > 0)
      };

    case CLEAR_CART:
      return initialState;

    default:
      return state;
  }
}

// Create context
const CartContext = createContext();

// Provider
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = item => dispatch({ type: ADD_ITEM, payload: item });
  const removeFromCart = name => dispatch({ type: REMOVE_ITEM, payload: name });
  const clearCart = () => dispatch({ type: CLEAR_CART });

  return (
    <CartContext.Provider value={{ cartItems: state.cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook
export function useCart() {
  return useContext(CartContext);
}
