import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Settings {
    storeName: string;
    storeAddress: string;
    storePhone: string;
    currency: string;
    taxRate: number;
    receiptHeader: string;
    receiptFooter: string;
}

interface SettingsState {
    settings: Settings;
    updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: {
                storeName: 'My Retail POS',
                storeAddress: '123 Business St, City, Country',
                storePhone: '+1 234 567 890',
                currency: '₹',
                taxRate: 10,
                receiptHeader: 'Thank you for shopping with us!',
                receiptFooter: 'Please visit again!',
            },
            updateSettings: (newSettings) => set((state) => ({
                settings: { ...state.settings, ...newSettings }
            })),
        }),
        {
            name: 'pos-settings',
        }
    )
);
