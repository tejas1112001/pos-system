import { create } from 'zustand';
import type { Product, CartItem } from '../types';

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],

    addItem: (product) => set((state) => {
        // For variant support, we treat Product ID + Variant ID as unique
        const selectedVariantId = (product as CartItem).selectedVariantId;
        const existing = state.items.find((item) =>
            item.id === product.id && item.selectedVariantId === selectedVariantId
        );

        if (existing) {
            return {
                items: state.items.map((item) =>
                    (item.id === product.id && item.selectedVariantId === selectedVariantId)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            };
        }

        return { items: [...state.items, { ...product, quantity: 1, selectedVariantId }] };
    }),

    removeItem: (id) => set((state) => ({
        // Note: In a real system, we might need a composite key (id + variantId)
        // For now, we'll assume the 'id' passed here is unique or handled by the UI
        items: state.items.filter((item) => {
            const compositeMatch = item.id === id || `${item.id}-${item.selectedVariantId}` === id;
            return !compositeMatch;
        }),
    })),

    updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) => {
            const isMatch = item.id === id || `${item.id}-${item.selectedVariantId}` === id;
            return isMatch ? { ...item, quantity: Math.max(0, quantity) } : item;
        }).filter(item => item.quantity > 0),
    })),

    clearCart: () => set({ items: [] }),

    total: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
            // Use variant price if it exists, otherwise base price
            let price = item.price;
            if (item.selectedVariantId && item.variants) {
                const variant = item.variants.find(v => v.id === item.selectedVariantId);
                if (variant?.price !== undefined) price = variant.price;
            }
            return sum + (price * item.quantity);
        }, 0);
    },
}));
