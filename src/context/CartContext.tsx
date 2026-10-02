import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
  isSubscription: boolean;
  deliveryFrequency: string;
  bundleTier?: { quantity: number; discountPercent: number; label: string };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  appliedPromoCode: string | null;
  promoDiscount: number;
  promoDiscountType: 'fixed' | 'percent';
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number; isSubscription: boolean; deliveryFrequency: string; bundleTier?: { quantity: number; discountPercent: number; label: string } } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: { id: string; isSubscription: boolean; deliveryFrequency: string } }
  | { type: 'TOGGLE_CART' }
  | { type: 'APPLY_PROMO_CODE'; payload: { code: string; discount: number; discountType: 'fixed' | 'percent' } }
  | { type: 'REMOVE_PROMO_CODE' }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  isOpen: false,
  appliedPromoCode: null,
  promoDiscount: 0,
  promoDiscountType: 'fixed',
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Match on product.id + subscription flag + delivery frequency so a one-time
      // tin and a subscription tin for the same product are separate lines.
      const existingItemIndex = state.items.findIndex(
        item =>
          item.product.id === action.payload.product.id &&
          item.isSubscription === action.payload.isSubscription &&
          item.deliveryFrequency === action.payload.deliveryFrequency
      );
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
          isSubscription: action.payload.isSubscription,
          deliveryFrequency: action.payload.deliveryFrequency,
          bundleTier: action.payload.bundleTier,
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
          bundleTier: action.payload.bundleTier,
        }],
      };
    }

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
          item.product.id === action.payload.id
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
        promoDiscountType: action.payload.discountType,
      };

    case 'REMOVE_PROMO_CODE':
      return {
        ...state,
        appliedPromoCode: null,
        promoDiscount: 0,
        promoDiscountType: 'fixed',
      };

    case 'CLEAR_CART':
      return { 
        ...state, 
        items: [], 
        appliedPromoCode: null, 
        promoDiscount: 0,
        promoDiscountType: 'fixed',
      };

    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const CART_STORAGE_KEY = 'carehub_cart';

// Restore the cart from localStorage so a page refresh does not lose it.
// Never restore isOpen (a refresh should not reopen the sidebar).
// Also strip stale state fields that should be recomputed.
const loadInitialState = (): CartState => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartState;
      if (parsed && Array.isArray(parsed.items)) {
        // Force isOpen to false on load regardless of what was persisted
        return { ...initialState, items: parsed.items, isOpen: false };
      }
    }
  } catch (error) {
    console.error('Error restoring cart from localStorage:', error);
  }
  return initialState;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  // Persist the cart whenever it changes.
  React.useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state]);

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