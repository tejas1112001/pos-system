import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { MockService } from '../services/mockData';
import { ProductModal, type ProductFormValues } from '../components/products/ProductModal';
import { Button } from '../components/ui/Button';
import { faker } from '@faker-js/faker';
import { cn } from '../utils/cn';

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        MockService.getProducts().then((data) => {
            setProducts(data);
            setLoading(false);
        });
    }, []);

    const handleAddProduct = (data: ProductFormValues) => {
        const productStock = data.hasVariants && data.variants
            ? data.variants.reduce((acc: number, v) => acc + (Number(v.stock) || 0), 0)
            : Number(data.stock);

        const newProduct: Product = {
            ...data,
            id: faker.string.uuid(),
            sku: data.sku || `SKU-${Math.random().toString(36).substring(7).toUpperCase()}`,
            barcode: data.barcode || faker.string.numeric(12),
            stock: productStock,
            variants: data.hasVariants && data.variants ? data.variants.map((v) => ({
                ...v,
                id: v.id || faker.string.uuid(),
                size: v.size,
                color: v.color,
                name: v.name || `${v.size} / ${v.color}`,
                stock: Number(v.stock) || 0,
                price: v.price ? Number(v.price) : undefined,
                costPrice: v.costPrice ? Number(v.costPrice) : undefined,
            })) : undefined,
            image: data.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
            images: data.images
        };
        setProducts([newProduct, ...products]);
    };

    const totalPortfolioValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
    const totalProjectedRevenue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStockItems = products.filter(p => p.stock <= (p.minStockLevel || 5)).length;
    const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);

    if (loading) return <div className="p-8 dark:text-gray-400">Loading products...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Header & Action */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-gray-100 uppercase tracking-tight">Inventory <span className="text-blue-600">Intelligence</span></h1>
                    <p className="text-gray-500 text-[10px] mt-1 font-black uppercase tracking-[0.2em] opacity-60">Full control over your retail catalog & stock health</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="h-14 px-8 rounded-2xl bg-black dark:bg-white dark:text-black text-white font-black uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                >
                    + Establish New Product
                </Button>
            </div>

            {/* 2. Intelligence Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Portfolio Value</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums">₹{totalPortfolioValue.toLocaleString()}</h3>
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter mt-1">Total Investment (at Cost)</p>
                </div>

                <div className="bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Projected Revenue</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums">₹{totalProjectedRevenue.toLocaleString()}</h3>
                    <p className="text-[9px] font-black text-green-500 uppercase tracking-tighter mt-1">Gross Selling Value</p>
                </div>

                <div className="bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Critical Stock</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums">{lowStockItems}</h3>
                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-tighter mt-1">Items Below Threshold</p>
                </div>

                <div className="bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Stock Density</p>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums">{totalUnits}</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1 opacity-60">Total Units in Supply</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Product Info</th>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">SKU / Barcode</th>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Category</th>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right">Cost / Price</th>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Stock Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <img
                                                src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'}
                                                className="w-full h-full object-cover"
                                                alt={product.name}
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-gray-900 dark:text-gray-100">{product.name}</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                {product.variants && product.variants.length > 0 ? (
                                                    <span className="text-[9px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                        {product.variants.length} Variants
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                                                        Standard
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-0.5">
                                        <code className="text-[11px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-1.5 py-0.5 rounded w-fit">{product.sku}</code>
                                        <p className="text-gray-400 text-[10px] font-medium tracking-tight mt-1">{product.barcode || 'NO BARCODE'}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{product.category}</span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-0.5 opacity-60">₹{product.costPrice?.toFixed(2)}</p>
                                        <p className="font-black text-sm text-gray-900 dark:text-gray-100 underline decoration-blue-500/30 decoration-2 underline-offset-4 tracking-tight">₹{product.price.toFixed(2)}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1.5">
                                        <div className={cn(
                                            "flex items-center gap-2 w-fit px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                                            product.stock <= 0 ? "bg-red-50 border-red-100 text-red-600 dark:bg-red-900/10 dark:border-red-800" :
                                                product.stock <= (product.minStockLevel || 5) ? "bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-900/10 dark:border-orange-800" :
                                                    "bg-green-50 border-green-100 text-green-600 dark:bg-green-900/10 dark:border-green-800"
                                        )}>
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full animate-pulse",
                                                product.stock <= 0 ? "bg-red-500" :
                                                    product.stock <= (product.minStockLevel || 5) ? "bg-orange-500" :
                                                        "bg-green-500"
                                            )} />
                                            {product.stock} Units
                                        </div>
                                        {product.stock <= (product.minStockLevel || 5) && product.stock > 0 && (
                                            <span className="text-[9px] text-orange-600 dark:text-orange-400 font-black uppercase tracking-tighter opacity-80">Restock Soon</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleAddProduct}
            />
        </div>
    );
}
