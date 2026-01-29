export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'cashier';
    avatar?: string;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
}

export interface ProductVariant {
    id: string;
    size: string;
    color: string;
    name: string; // e.g., "M / Blue"
    sku: string;
    barcode: string;
    price?: number; // Override base price if specified
    costPrice?: number; // Override base cost if specified
    stock: number;
}

export interface Product {
    id: string;
    name: string;
    sku: string;
    barcode: string;
    category: string;
    price: number; // Selling Price (Base)
    costPrice: number; // Purchase Price (Base)
    stock: number; // Total stock if no variants, or sum of variant stocks
    minStockLevel: number;
    image?: string;
    images?: string[];
    supplierId?: string;
    variants?: ProductVariant[];
}

export interface CartItem extends Product {
    quantity: number;
    selectedVariantId?: string;
}

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    subtotal: number;
    tax: number;
    profit: number; // total - (sum of items costPrice * quantity)
    paymentMethod: 'cash' | 'card' | 'digital' | 'split';
    createdAt: string;
    cashierId: string;
    status: 'completed' | 'refunded';
}

export interface PurchaseOrder {
    id: string;
    supplierId: string;
    items: {
        productId: string;
        variantId?: string;
        quantity: number;
        costPrice: number;
    }[];
    totalAmount: number;
    status: 'pending' | 'received' | 'cancelled';
    receivedAt?: string;
    createdAt: string;
}

export interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    totalProfit: number;
    lowStockCount: number;
}
