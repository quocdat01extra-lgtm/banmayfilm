'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface PreorderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface PreorderContextType {
  preorderCart: PreorderItem[];
  addToPreorder: (item: Omit<PreorderItem, 'quantity'> & { quantity?: number }) => void;
  removeFromPreorder: (productId: string) => void;
  updatePreorderQuantity: (productId: string, quantity: number) => void;
  clearPreorderCart: () => void;
  getPreorderTotal: () => number;
  getPreorderItemCount: () => number;
}

const PreorderContext = createContext<PreorderContextType | undefined>(undefined);

export const PreorderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preorderCart, setPreorderCart] = useState<PreorderItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('bmf_preorder_cart');
      if (savedCart) {
        setPreorderCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load preorder cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('bmf_preorder_cart', JSON.stringify(preorderCart));
    }
  }, [preorderCart, isLoaded]);

  const addToPreorder = (item: Omit<PreorderItem, 'quantity'> & { quantity?: number }) => {
    setPreorderCart((prevCart) => {
      // In preorder, we still group by product_id or product_id + color, but here product_id + name acts as unique
      // Wait, name already contains the color. Let's find by name to be safe with colors.
      const existingItem = prevCart.find((i) => i.name === item.name);
      const addQty = item.quantity || 1;
      
      if (existingItem) {
        return prevCart.map((i) =>
          i.name === item.name
            ? { ...i, quantity: i.quantity + addQty }
            : i
        );
      }
      return [...prevCart, { ...item, quantity: addQty }];
    });
  };

  const removeFromPreorder = (productId: string) => {
    setPreorderCart((prevCart) => prevCart.filter((i) => i.product_id !== productId));
  };

  const updatePreorderQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromPreorder(productId);
      return;
    }
    setPreorderCart((prevCart) =>
      prevCart.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  };

  const clearPreorderCart = () => {
    setPreorderCart([]);
  };

  const getPreorderTotal = () => {
    return preorderCart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getPreorderItemCount = () => {
    return preorderCart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <PreorderContext.Provider
      value={{
        preorderCart,
        addToPreorder,
        removeFromPreorder,
        updatePreorderQuantity,
        clearPreorderCart,
        getPreorderTotal,
        getPreorderItemCount,
      }}
    >
      {children}
    </PreorderContext.Provider>
  );
};

export const usePreorder = () => {
  const context = useContext(PreorderContext);
  if (!context) {
    throw new Error('usePreorder must be used within a PreorderProvider');
  }
  return context;
};
