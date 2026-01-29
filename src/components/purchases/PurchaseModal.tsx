import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Dialog, DialogHeader, DialogTitle } from '../ui/Dialog';
import type { Product, Supplier, ProductVariant } from '../../types';
import { useEffect, useState } from 'react';
import { MockService } from '../../services/mockData';
import { Trash2, PackageCheck, Truck, ChevronDown, Search, ArrowRight } from 'lucide-react';

const purchaseItemSchema = z.object({
    productId: z.string().min(1, 'Product is required'),
    variantId: z.string().optional(),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    costPrice: z.coerce.number().min(0.01, 'Cost price is required'),
});

const purchaseSchema = z.object({
    supplierId: z.string().min(1, 'Supplier is required'),
    items: z.array(purchaseItemSchema).min(1, 'Add at least one item'),
    status: z.enum(['pending', 'received']).default('received'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: PurchaseFormValues) => void;
}

export function PurchaseModal({ open, onOpenChange, onSubmit }: PurchaseModalProps) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { register, control, handleSubmit, formState: { errors }, reset, watch } = useForm<PurchaseFormValues>({
        resolver: zodResolver(purchaseSchema) as any,
        defaultValues: {
            supplierId: '',
            items: [],
            status: 'received',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    useEffect(() => {
        if (open) {
            Promise.all([
                MockService.getSuppliers(),
                MockService.getProducts()
            ]).then(([s, p]) => {
                setSuppliers(s);
                setProducts(p);
            });
            reset();
        }
    }, [open, reset]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addProductToPurchase = (product: Product, variant?: ProductVariant) => {
        append({
            productId: product.id,
            variantId: variant?.id,
            quantity: 1,
            costPrice: variant?.costPrice || product.costPrice,
        });
        setSearchQuery('');
    };

    const totalAmount = watch('items')?.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0) || 0;

    const getProductName = (productId: string) => products.find(p => p.id === productId)?.name || 'Product';
    const getVariantName = (productId: string, variantId?: string) => {
        if (!variantId) return '';
        const product = products.find(p => p.id === productId);
        const variant = product?.variants?.find(v => v.id === variantId);
        return variant ? `${variant.size} / ${variant.color}` : '';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-5xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <PackageCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black uppercase tracking-tight">Record Stock <span className="text-blue-600">Arrival</span></span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Procurement & Inventory Intake</span>
                    </div>
                </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 my-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Supplier & Search */}
                    <div className="md:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Select Supplier</label>
                            <div className="relative">
                                <select
                                    {...register('supplierId')}
                                    className="appearance-none w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-5 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                >
                                    <option value="">Locate Partner</option>
                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            {errors.supplierId && <p className="text-[10px] text-red-500 mt-2 font-black uppercase tracking-tighter">{errors.supplierId.message}</p>}
                        </div>

                        <div className="bg-white dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Identify Products</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by SKU or Name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all"
                                />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-2">
                                {searchQuery && filteredProducts.map(p => (
                                    <div key={p.id} className="space-y-1">
                                        {p.variants && p.variants.length > 0 ? (
                                            p.variants.map(v => (
                                                <button
                                                    key={v.id}
                                                    type="button"
                                                    onClick={() => addProductToPurchase(p, v)}
                                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all group"
                                                >
                                                    <div className="text-left">
                                                        <span className="block text-[11px] font-black text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors uppercase">{p.name}</span>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{v.size} / {v.color}</span>
                                                    </div>
                                                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => addProductToPurchase(p)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all group"
                                            >
                                                <div className="text-left">
                                                    <span className="block text-[11px] font-black text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors uppercase">{p.name}</span>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{p.sku}</span>
                                                </div>
                                                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Items Table */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800/40 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden min-h-[400px]">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/10 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Shipment Content</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">{fields.length} Unique Items</span>
                            </div>

                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-6">
                                {fields.length === 0 ? (
                                    <div className="py-20 text-center flex flex-col items-center justify-center opacity-30">
                                        <Truck className="w-12 h-12 mb-4 text-gray-300" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Empty Shipment</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-12 gap-4 items-center bg-gray-50/50 dark:bg-gray-900/10 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/30 group hover:border-blue-200 transition-all">
                                                <div className="col-span-4">
                                                    <p className="text-[10px] font-black text-gray-900 dark:text-gray-100 uppercase truncate">{getProductName(watch(`items.${index}.productId`))}</p>
                                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{getVariantName(watch(`items.${index}.productId`), watch(`items.${index}.variantId`)) || 'Standard Edition'}</p>
                                                </div>
                                                <div className="col-span-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Qty Received</label>
                                                        <input
                                                            {...register(`items.${index}.quantity` as const)}
                                                            type="number"
                                                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm font-black focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Unit Cost (₹)</label>
                                                        <input
                                                            {...register(`items.${index}.costPrice` as const)}
                                                            type="number"
                                                            step="0.01"
                                                            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-sm font-black focus:ring-2 focus:ring-blue-500/20 transition-all text-blue-600"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-span-1 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl shadow-blue-500/20 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Total Shipment Value</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-sm font-bold opacity-60">₹</span>
                                    <span className="text-4xl font-black tabular-nums">{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={fields.length === 0}
                                className="h-16 px-12 rounded-[1.5rem] bg-white text-blue-600 hover:bg-gray-50 font-black uppercase tracking-widest shadow-xl transition-all active:scale-95"
                            >
                                <PackageCheck className="w-5 h-5 mr-3" />
                                Finalize Stock In
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Dialog>
    );
}
