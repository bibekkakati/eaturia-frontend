import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Required Cart format by api public.createOrder: Record<string, number> - Format: { itemId: quantity }
interface CartContextType {
  cart: Record<string, number>;
  restaurantId: string | null;
  menuId: string | null;
  addToCart: (restaurantId: string, menuId: string, itemId: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Context provider for managing the customer's shopping cart and order persistence. */
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  const addToCart = (rId: string, mId: string, itemId: string, quantity: number = 1) => {
    // Check if adding to cart from a different restaurant/menu. Prevent or reset context.
    if (restaurantId !== rId || menuId !== mId) {
      if (Object.keys(cart).length > 0) {
        // Here you might prompt the user, but for simplicity we overwrite if it's a new restaurant
        console.warn("Switching restaurant context, cart reset.");
      }
      setRestaurantId(rId);
      setMenuId(mId);
      setCart({ [itemId]: quantity });
      return;
    }

    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + quantity
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => ({
      ...prev,
      [itemId]: quantity
    }));
  };

  const clearCart = () => {
    setCart({});
    setRestaurantId(null);
    setMenuId(null);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, restaurantId, menuId, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
