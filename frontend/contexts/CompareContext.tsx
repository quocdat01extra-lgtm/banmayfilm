'use client';

import React, { createContext, useContext, useState } from 'react';

export interface CompareProduct {
  id: string;
  name: string;
  price: number;
  specifications: string;
  image_url?: string;
  category_name?: string;
}

interface CompareContextType {
  compareList: CompareProduct[];
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isBarVisible: boolean;
  setBarVisible: (visible: boolean) => void;
  isCompareModalOpen: boolean;
  setCompareModalOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<CompareProduct[]>([]);
  const [isBarVisible, setBarVisible] = useState(false);
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);

  const addToCompare = (product: CompareProduct) => {
    setCompareList((prevList) => {
      // Don't add duplicate
      if (prevList.some((p) => p.id === product.id)) {
        return prevList;
      }
      // Max 3 products
      if (prevList.length >= 3) {
        alert('Bạn chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc.');
        return prevList;
      }
      setBarVisible(true); // Automatically show bar when adding product
      return [...prevList, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareList((prevList) => {
      const newList = prevList.filter((p) => p.id !== productId);
      if (newList.length === 0) {
        setBarVisible(false);
      }
      return newList;
    });
  };

  const clearCompare = () => {
    setCompareList([]);
    setBarVisible(false);
    setCompareModalOpen(false);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isBarVisible,
        setBarVisible,
        isCompareModalOpen,
        setCompareModalOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
