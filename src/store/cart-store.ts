import { create } from 'zustand';
import { Product, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  discount: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  
  addItem: (product, quantity = 1) => {
    // Validar se o produto tem ID válido
    if (!product.id || product.id.trim() === '') {
      console.error('[Cart] Tentativa de adicionar produto sem ID:', product);
      throw new Error(`Produto "${product.name}" não possui ID válido. Não é possível adicionar ao carrinho.`);
    }
    
    // Verificar se é o UUID problemático reportado
    if (product.id.includes('00000000-0000-4000-8000-000063ef2970')) {
      console.error('[Cart] Tentativa de adicionar produto com ID corrompido:', product);
      throw new Error(`Produto "${product.name}" possui ID corrompido. Não é possível adicionar ao carrinho.`);
    }
    
    const items = get().items;
    const existingItem = items.find((item) => item.product.id === product.id);
    
    if (existingItem) {
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * product.price,
              }
            : item
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            product,
            quantity,
            subtotal: quantity * product.price,
          },
        ],
      });
    }
  },
  
  removeItem: (productId) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    });
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    
    set({
      items: get().items.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.price,
            }
          : item
      ),
    });
  },
  
  setDiscount: (discount) => {
    set({ discount });
  },
  
  clearCart: () => {
    set({ items: [], discount: 0 });
  },
  
  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.subtotal, 0);
  },
  
  getTotal: () => {
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - get().discount);
  },
}));
