import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
  isSubscription: boolean;
  deliveryFrequency: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedPromoCode: string | null;
  promoDiscount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; isSubscription: boolean; deliveryFrequency: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: { id: string; isSubscription: boolean; deliveryFrequency: string } }
  | { type: 'TOGGLE_CART' }
  | { type: 'APPLY_PROMO_CODE'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_PROMO_CODE' }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  isOpen: false,
  appliedPromoCode: null,
  promoDiscount: 0,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === action.payload.product.id
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
          isSubscription: action.payload.isSubscription,
          deliveryFrequency: action.payload.deliveryFrequency,
        };
        return { ...state, items: updatedItems };
      }
      
      return {
        ...state,
        items: [...state.items, {
          product: action.payload.product,
          quantity: action.payload.quantity,
          isSubscription: action.payload.isSubscription,
          deliveryFrequency: action.payload.deliveryFrequency,
        }],
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        items: state.items.map(item =>
          item.product.id === action.payload.id && item.isSubscription === action.payload.isSubscription
            ? { 
                ...item, 
                isSubscription: action.payload.isSubscription,
                deliveryFrequency: action.payload.deliveryFrequency 
              }
            : item
        ),
      };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'APPLY_PROMO_CODE':
      return {
        ...state,
        appliedPromoCode: action.payload.code,
        promoDiscount: action.payload.discount,
      };

    case 'REMOVE_PROMO_CODE':
      return {
        ...state,
        appliedPromoCode: null,
        promoDiscount: 0,
      };

    case 'CLEAR_CART':
      return { 
        ...state, 
        items: [], 
        appliedPromoCode: null, 
        promoDiscount: 0 
      };

    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};