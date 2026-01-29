import { useEffect, useState, useCallback } from 'react';
import { Search, ShoppingCart, Percent, Trash, Tag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { MockService } from '../services/mockData';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Product, CartItem } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { CheckoutModal } from '../components/ui/CheckoutModal';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { cn } from '../utils/cn';

// COMPONENTS will be moved to separate files later for cleaner code
const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => {
    const { settings } = useSettingsStore();
    return (
        <Card
            className="overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col relative border-gray-200/50 dark:border-gray-700/50"
            onClick={onClick}
        >
            <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {product.stock < 10 && (
                        <div className={cn("text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-sm text-white", product.stock <= 0 ? "bg-red-600" : "bg-orange-600")}>
                            {product.stock <= 0 ? 'Out of Stock' : 'Low Stock'}
                        </div>
                    )}
                    {product.variants && product.variants.length > 0 && (
                        <div className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter shadow-sm flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" />
                            {product.variants.length} Variants
                        </div>
                    )}
                </div>
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    {/* Fixed height (2 lines) ensures Price/SKU always align horizontally */}
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm leading-tight h-[2.5rem] mb-1">{product.name}</h3>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest font-mono truncate">{product.sku}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3">
                    <span className="font-black text-lg text-blue-600 dark:text-blue-400 tabular-nums">
                        {settings.currency}{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

const VariantSelector = ({ product, open, onOpenChange, onSelect }: { product: Product | null, open: boolean, onOpenChange: (open: boolean) => void, onSelect: (variantId: string) => void }) => {
    if (!product || !product.variants) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-md">
            <DialogHeader>
                <DialogTitle>Select Variant - {product.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-2 my-4">
                {product.variants.map((v) => (
                    <button
                        key={v.id}
                        onClick={() => {
                            onSelect(v.id);
                            onOpenChange(false);
                        }}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                        disabled={v.stock <= 0}
                    >
                        <div>
                            <p className="font-bold dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">{v.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{v.sku}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold dark:text-gray-100">{useSettingsStore.getState().settings.currency}{(v.price ?? product.price).toFixed(2)}</p>
                            <p className={cn("text-[10px] font-bold", v.stock <= 0 ? "text-red-500" : "text-gray-400")}>
                                {v.stock <= 0 ? 'Out of Stock' : `${v.stock} Available`}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            </DialogFooter>
        </Dialog>
    );
}

const CartSidebar = ({ onCheckout }: { onCheckout: () => void }) => {
    const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
    const { settings } = useSettingsStore();
    const subtotal = total();
    const tax = subtotal * (settings.taxRate / 100);
    const grandTotal = subtotal + tax;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-200">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2 dark:text-gray-100">
                    <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Current Order
                </h2>
                {items.length > 0 && (
                    <button onClick={clearCart} className="text-red-500 dark:text-red-400 text-sm hover:underline">Clear</button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 space-y-4">
                        <ShoppingCart className="w-16 h-16 opacity-20" />
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    items.map((item) => {
                        const variant = item.selectedVariantId && item.variants
                            ? item.variants.find(v => v.id === item.selectedVariantId)
                            : null;
                        const displayPrice = variant?.price ?? item.price;
                        const itemId = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;

                        return (
                            <div key={itemId} className="flex gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg group border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all">
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h4 className="font-bold text-xs truncate dark:text-gray-200">{item.name}</h4>
                                            {variant && (
                                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">{variant.name}</span>
                                            )}
                                        </div>
                                        <span className="font-bold text-sm min-w-max dark:text-gray-100">{settings.currency}{(displayPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-0.5 shadow-sm">
                                            <button
                                                onClick={() => item.quantity > 1 ? updateQuantity(itemId, item.quantity - 1) : removeItem(itemId)}
                                                className="w-5 h-5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >-</button>
                                            <span className="text-[11px] w-4 text-center font-bold dark:text-gray-200">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                                className="w-5 h-5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                            >+</button>
                                        </div>
                                        <button onClick={() => removeItem(itemId)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 space-y-5 backdrop-blur-sm">
                <div className="space-y-2.5">
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <span>Subtotal</span>
                        <span className="text-gray-900 dark:text-gray-100">{settings.currency}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 font-medium">
                        <span>Tax ({settings.taxRate}%)</span>
                        <span className="text-gray-900 dark:text-gray-100">{settings.currency}{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-center bg-gray-900 dark:bg-white p-5 rounded-2xl shadow-xl shadow-gray-900/10 dark:shadow-white/5 border border-transparent transition-all hover:scale-[1.01]">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 leading-none mb-1.5">Total Amount</span>
                                <span className="text-xs font-bold text-blue-500 dark:text-blue-600 uppercase tracking-widest">Payable</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-blue-500 dark:text-blue-600 leading-none">{settings.currency}</span>
                                <span className="text-3xl font-black text-white dark:text-gray-900 tabular-nums leading-none">
                                    {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                        <Tag className="w-4 h-4 mr-2" />
                        Discount
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Percent className="w-4 h-4 mr-2" />
                        Tax
                    </Button>
                </div>

                <Button
                    className="w-full py-6 text-lg shadow-lg dark:shadow-blue-900/20"
                    size="lg"
                    onClick={onCheckout}
                    disabled={items.length === 0}
                >
                    Pay Now
                </Button>
            </div>
        </div>
    );
};

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    const { addItem } = useCartStore();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    useEffect(() => {
        MockService.getProducts().then(data => {
            setProducts(data);
            setLoading(false);
        });
    }, []);

    const [variantDialogProduct, setVariantDialogProduct] = useState<Product | null>(null);

    const handleProductClick = useCallback((product: Product, variantId?: string) => {
        if (!variantId && product.variants && product.variants.length > 0) {
            setVariantDialogProduct(product);
        } else {
            addItem({ ...product, quantity: 1, selectedVariantId: variantId } as CartItem);
        }
    }, [addItem]);

    // BARCODE SCANNER LOGIC
    useEffect(() => {
        let buffer = "";
        let lastKeyTime = Date.now();

        const handleKeyDown = (e: KeyboardEvent) => {
            const currentTime = Date.now();

            // Scanner input is fast (usually < 30ms between keys)
            if (currentTime - lastKeyTime > 50) {
                buffer = "";
            }

            if (e.key === "Enter") {
                if (buffer.length >= 8) {
                    processBarcode(buffer);
                    buffer = "";
                }
            } else if (e.key.length === 1) {
                buffer += e.key;
            }

            lastKeyTime = currentTime;
        };

        const processBarcode = (code: string) => {
            const product = products.find(p =>
                p.barcode === code ||
                p.variants?.some(v => v.barcode === code)
            );

            if (product) {
                const variant = product.variants?.find(v => v.barcode === code);
                handleProductClick(product, variant?.id);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [products, handleProductClick]);

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            p.barcode.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === 'All' || p.category === category;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="fixed inset-0 top-16 flex bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex gap-4 items-center relative transition-colors duration-200">
                    <div className="relative w-80 flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm"
                            placeholder="Scan Barcode or Search (Name/SKU)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="relative flex-1 overflow-hidden">
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pr-12">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                                        category === cat
                                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30"
                                            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        {/* Fade effect for horizontal scroll */}
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex h-full items-center justify-center dark:text-gray-400 font-medium">Wait, fetching items...</div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => handleProductClick(product)}
                                />
                            ))}
                        </div>
                    )}
                    {filteredProducts.length === 0 && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                            <Tag className="w-16 h-16 opacity-10" />
                            <p className="font-medium italic">No matches found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-96 flex-shrink-0 z-20">
                <CartSidebar onCheckout={() => setIsCheckoutOpen(true)} />
            </div>

            <VariantSelector
                product={variantDialogProduct}
                open={!!variantDialogProduct}
                onOpenChange={(open) => !open && setVariantDialogProduct(null)}
                onSelect={(variantId) => handleProductClick(variantDialogProduct!, variantId)}
            />

            <CheckoutModal
                open={isCheckoutOpen}
                onOpenChange={setIsCheckoutOpen}
                onSuccess={() => {/* Toast notification could go here */ }}
            />
        </div>
    );
}
