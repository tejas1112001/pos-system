import { faker } from '@faker-js/faker';
import type { Product, Order, User, DashboardStats, Supplier, PurchaseOrder } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@pos.com',
        role: 'admin',
        avatar: faker.image.avatar(),
    },
    {
        id: '2',
        name: 'Jane Cashier',
        email: 'jane@pos.com',
        role: 'cashier',
        avatar: faker.image.avatar(),
    },
];

export const MOCK_SUPPLIERS: Supplier[] = Array.from({ length: 5 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    contactPerson: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
}));

export const MOCK_PRODUCTS: Product[] = Array.from({ length: 50 }).map(() => {
    const price = parseFloat(faker.commerce.price({ min: 10, max: 200 }));
    const costPrice = price * (faker.number.float({ min: 0.4, max: 0.7 })); // 40-70% margin

    return {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        sku: `SKU-${faker.string.alphanumeric(6).toUpperCase()}`,
        barcode: faker.string.numeric(12),
        category: faker.commerce.department(),
        price,
        costPrice,
        stock: faker.number.int({ min: 0, max: 100 }),
        minStockLevel: 10,
        image: faker.image.urlLoremFlickr({ category: 'fashion' }),
        supplierId: faker.helpers.arrayElement(MOCK_SUPPLIERS).id,
    };
});

export const MOCK_ORDERS: Order[] = Array.from({ length: 20 }).map(() => {
    const items = faker.helpers.arrayElements(MOCK_PRODUCTS, { min: 1, max: 5 }).map(p => ({
        ...p,
        quantity: faker.number.int({ min: 1, max: 3 })
    }));

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalCost = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return {
        id: faker.string.uuid(),
        items,
        subtotal,
        tax,
        total,
        profit: total - totalCost - tax, // Profit excluding tax
        paymentMethod: faker.helpers.arrayElement(['cash', 'card', 'digital', 'split']),
        createdAt: faker.date.recent({ days: 30 }).toISOString(),
        cashierId: faker.helpers.arrayElement(MOCK_USERS).id,
        status: 'completed',
    };
});

export const MOCK_PURCHASES: PurchaseOrder[] = Array.from({ length: 10 }).map(() => {
    const supplier = faker.helpers.arrayElement(MOCK_SUPPLIERS);
    const items = faker.helpers.arrayElements(MOCK_PRODUCTS, { min: 1, max: 8 }).map(p => ({
        productId: p.id,
        quantity: faker.number.int({ min: 10, max: 50 }),
        costPrice: p.costPrice
    }));

    const totalAmount = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

    return {
        id: `PO-${faker.string.numeric(6)}`,
        supplierId: supplier.id,
        items,
        totalAmount,
        status: 'received',
        receivedAt: faker.date.recent({ days: 15 }).toISOString(),
        createdAt: faker.date.recent({ days: 20 }).toISOString(),
    };
});

// Simulated Async Services
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const MockService = {
    getProducts: async (): Promise<Product[]> => {
        await delay(500);
        return MOCK_PRODUCTS;
    },

    getOrders: async (): Promise<Order[]> => {
        await delay(600);
        return MOCK_ORDERS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    getSuppliers: async (): Promise<Supplier[]> => {
        await delay(400);
        return MOCK_SUPPLIERS;
    },

    getPurchases: async (): Promise<PurchaseOrder[]> => {
        await delay(500);
        return MOCK_PURCHASES;
    },

    login: async (email: string): Promise<User | undefined> => {
        await delay(800);
        return MOCK_USERS.find(u => u.email === email);
    },

    getStats: async (): Promise<DashboardStats> => {
        await delay(400);
        const totalSales = MOCK_ORDERS.reduce((acc, order) => acc + order.total, 0);
        const totalProfit = MOCK_ORDERS.reduce((acc, order) => acc + order.profit, 0);
        return {
            totalSales,
            totalOrders: MOCK_ORDERS.length,
            totalProfit,
            lowStockCount: MOCK_PRODUCTS.filter(p => p.stock < 10).length,
        };
    }
};
