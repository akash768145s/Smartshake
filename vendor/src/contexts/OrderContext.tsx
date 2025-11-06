import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OrderState {
  flavours: Record<string, number>; // flavourId -> scoop count
  base: 'milk' | 'water' | null;
  quantity: number;
  totalPrice: number;
}

interface OrderContextType {
  order: OrderState;
  setFlavours: (flavours: Record<string, number>) => void;
  setBase: (base: 'milk' | 'water') => void;
  setQuantity: (quantity: number) => void;
  resetOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const initialOrder: OrderState = {
  flavours: {},
  base: null,
  quantity: 0,
  totalPrice: 0,
};

const calculatePrice = (quantity: number, flavours: Record<string, number>, base: 'milk' | 'water' | null): number => {
  // Calculate total scoops (each scoop = 99₹)
  const totalScoops = Object.values(flavours).reduce((sum, count) => sum + count, 0);
  const flavourCost = totalScoops * 99;
  
  // Calculate base cost (milk = 15₹ per 200ml, water = free)
  const volumeInMl = quantity * 5; // quantity is 0-100, representing 0-500ml
  const baseCost = base === 'milk' ? Math.round((volumeInMl / 200) * 15) : 0;
  
  return flavourCost + baseCost;
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [order, setOrder] = useState<OrderState>(initialOrder);

  const setFlavours = (flavours: Record<string, number>) => {
    setOrder(prev => ({
      ...prev,
      flavours,
      totalPrice: calculatePrice(prev.quantity, flavours, prev.base),
    }));
  };

  const setBase = (base: 'milk' | 'water') => {
    setOrder(prev => ({
      ...prev,
      base,
      totalPrice: calculatePrice(prev.quantity, prev.flavours, base),
    }));
  };

  const setQuantity = (quantity: number) => {
    setOrder(prev => ({
      ...prev,
      quantity,
      totalPrice: calculatePrice(quantity, prev.flavours, prev.base),
    }));
  };

  const resetOrder = () => {
    setOrder(initialOrder);
  };

  return (
    <OrderContext.Provider value={{ order, setFlavours, setBase, setQuantity, resetOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};
