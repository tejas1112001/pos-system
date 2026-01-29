import { useForm, useFieldArray } from 'react-hook-form';
import type { Resolver, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import type { Product, Supplier } from '../../types';
import { useEffect, useState, useRef } from 'react';
import { MockService } from '../../services/mockData';
import { Plus, Trash2, Box, Wand2, Upload, ImageIcon, ChevronDown, Receipt, LayoutGrid } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const COLORS = ['Red', 'Blue', 'Green', 'Black', 'White', 'Navy', 'Grey', 'Beige', 'Multiple'];
const CATEGORIES = ['T-Shirts', 'Jeans', 'Dresses', 'Jackets', 'Accessories', 'Footwear', 'Activewear'];

const variantSchema = z.object({
    id: z.string().optional(),
    size: z.string().min(1, 'Size required'),
    color: z.string().min(1, 'Color required'),
    name: z.string().min(1, 'Display name required'),
    sku: z.string().min(3, 'SKU required'),
    barcode: z.string().min(8, 'Barcode required'),
    price: z.coerce.number().min(0.01, 'Price must be positive').optional(),
    costPrice: z.coerce.number().min(0.01, 'Cost must be positive').optional(),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
});

const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    sku: z.string().min(3, 'SKU is required'),
    barcode: z.string().min(8, 'Barcode is required'),
    category: z.string().min(1, 'Category is required'),
    price: z.coerce.number().min(0.01, 'Price must be positive'),
    costPrice: z.coerce.number().min(0.01, 'Cost must be positive'),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
    minStockLevel: z.coerce.number().int().min(0, 'Alert level cannot be negative'),
    image: z.string().url('Invalid URL').optional().or(z.literal('')),
    images: z.array(z.string().url('Invalid URL')).optional(),
    supplierId: z.string().optional(),
    hasVariants: z.boolean().default(false),
    variants: z.array(variantSchema).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ProductFormValues) => void;
    initialData?: Product;
}

export function ProductModal({ open, onOpenChange, onSubmit, initialData }: ProductFormProps) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<string[]>(CATEGORIES);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'media' | 'variants'>('general');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, control, handleSubmit, formState: { errors }, reset, watch } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
        defaultValues: {
            name: '',
            sku: '',
            barcode: '',
            category: '',
            price: 0,
            costPrice: 0,
            stock: 0,
            minStockLevel: 5,
            image: '',
            supplierId: '',
            hasVariants: false,
            variants: [],
            ...initialData,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'variants'
    });

    const hasVariants = watch('hasVariants');

    useEffect(() => {
        MockService.getSuppliers().then(setSuppliers);
        if (open) {
            reset(initialData ? { ...initialData, hasVariants: !!initialData.variants?.length, images: initialData.images || [] } : undefined);
        }
    }, [open, initialData, reset]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const currentImages = watch('images') || [];
                const currentMain = watch('image');
                const result = reader.result as string;

                if (!currentMain) {
                    reset({ ...watch(), image: result });
                } else {
                    reset({ ...watch(), images: [...currentImages, result] });
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number, isMain: boolean) => {
        if (isMain) {
            const currentImages = watch('images') || [];
            if (currentImages.length > 0) {
                const newMain = currentImages[0];
                const remaining = currentImages.slice(1);
                reset({ ...watch(), image: newMain, images: remaining });
            } else {
                reset({ ...watch(), image: '' });
            }
        } else {
            const currentImages = watch('images') || [];
            reset({ ...watch(), images: currentImages.filter((_, i) => i !== index) });
        }
    };

    const handleFormSubmit: SubmitHandler<ProductFormValues> = (data) => {
        if (!data.hasVariants) {
            delete data.variants;
        }
        onSubmit(data);
        reset();
        onOpenChange(false);
    };

    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);

    const generateVariants = () => {
        if (selectedSizes.length === 0 || selectedColors.length === 0) return;

        const baseSku = watch('sku');
        const baseBarcode = watch('barcode');
        const price = watch('price');
        const costPrice = watch('costPrice');

        selectedSizes.forEach(size => {
            selectedColors.forEach(color => {
                const name = `${size} / ${color}`;
                // Check if variant already exists
                const exists = fields.some(f => f.size === size && f.color === color);
                if (!exists) {
                    append({
                        id: Math.random().toString(36).substring(7),
                        size,
                        color,
                        name,
                        sku: `${baseSku}-${size}-${color.substring(0, 3).toUpperCase()}`,
                        barcode: `${baseBarcode}${size}${color.substring(0, 1)}`,
                        price,
                        costPrice,
                        stock: 0
                    });
                }
            });
        });
        setSelectedSizes([]);
        setSelectedColors([]);
    };

    const addVariant = () => {
        append({
            id: Math.random().toString(36).substring(7),
            size: '',
            color: '',
            name: '',
            sku: `${watch('sku')}-${fields.length + 1}`,
            barcode: `${watch('barcode')}${fields.length + 1}`,
            stock: 0
        });
    };

    const price = watch('price');
    const cost = watch('costPrice');
    const profit = price - cost;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-blue-500" />
                    {initialData ? 'Edit Retail Product' : 'Add New Retail Product'}
                </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl mb-8 border border-gray-100/50 dark:border-gray-700/50 overflow-x-auto no-scrollbar">
                {[
                    { id: 'general', label: 'General', icon: Box },
                    { id: 'pricing', label: 'Financials', icon: Receipt },
                    { id: 'media', label: 'Media', icon: ImageIcon },
                    { id: 'variants', label: 'Variants', icon: Wand2 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            activeTab === tab.id
                                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-gray-700"
                                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 my-4 p-1">
                {/* 1. General Tab */}
                {activeTab === 'general' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
                                    <Box className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm dark:text-gray-200 uppercase tracking-[0.2em]">Core Identity</h4>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 opacity-60">Base product identification and categorization</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                                <Input label="Product Name" placeholder="e.g. Cotton T-Shirt" {...register('name')} error={errors.name?.message} />

                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-2.5">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category</label>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCategory(!isAddingCategory)}
                                            className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors"
                                        >
                                            {isAddingCategory ? 'Cancel' : '+ Add New'}
                                        </button>
                                    </div>

                                    {isAddingCategory ? (
                                        <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <input
                                                type="text"
                                                value={newCategory}
                                                onChange={(e) => setNewCategory(e.target.value)}
                                                placeholder="Enter category name..."
                                                className="flex-1 h-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-gray-100 transition-all"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (newCategory.trim()) {
                                                            setCategories(prev => [...prev, newCategory.trim()]);
                                                            reset({ ...watch(), category: newCategory.trim() });
                                                            setNewCategory('');
                                                            setIsAddingCategory(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (newCategory.trim()) {
                                                        setCategories(prev => [...prev, newCategory.trim()]);
                                                        reset({ ...watch(), category: newCategory.trim() });
                                                        setNewCategory('');
                                                        setIsAddingCategory(false);
                                                    }
                                                }}
                                                className="aspect-square h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all active:scale-90 shadow-lg shadow-blue-500/20"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                {...register('category')}
                                                className="appearance-none flex h-12 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-gray-100 transition-all cursor-pointer"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    )}
                                    {errors.category && !isAddingCategory && <p className="text-[10px] text-red-500 mt-1.5 font-bold uppercase tracking-tighter">{errors.category.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                                <div className="md:col-span-1">
                                    <Input label="Registry SKU" {...register('sku')} error={errors.sku?.message} />
                                </div>
                                <div className="md:col-span-1">
                                    <Input label="Global Barcode" {...register('barcode')} error={errors.barcode?.message} />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2.5">Supplier</label>
                                    <div className="relative">
                                        <select
                                            {...register('supplierId')}
                                            className="appearance-none flex h-12 w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-2 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-gray-100 transition-all cursor-pointer"
                                        >
                                            <option value="">Locate Partner</option>
                                            {suppliers.map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Pricing Tab */}
                {activeTab === 'pricing' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="bg-white dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                                        <Receipt className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h4 className="font-black text-sm dark:text-gray-200 uppercase tracking-[0.2em]">Procurement & Sales</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <Input label="MRP / Price (₹)" type="number" step="0.01" {...register('price')} error={errors.price?.message} />
                                    <Input label="Purchase Cost (₹)" type="number" step="0.01" {...register('costPrice')} error={errors.costPrice?.message} />
                                </div>

                                <div className={cn(
                                    "p-6 rounded-3xl flex flex-col justify-center border-2 transition-all duration-500",
                                    margin > 30 ? "bg-green-50/30 border-green-100/50 text-green-700 dark:bg-green-900/10 dark:border-green-800/30" :
                                        margin > 10 ? "bg-orange-50/30 border-orange-100/50 text-orange-700 dark:bg-orange-900/10 dark:border-orange-800/30" :
                                            "bg-red-50/30 border-red-100/50 text-red-700 dark:bg-red-900/10 dark:border-red-800/30"
                                )}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-black uppercase tracking-[0.1em] opacity-60">Return on Investment</span>
                                        <span className="font-black text-3xl tabular-nums tracking-tighter">{margin.toFixed(1)}% <span className="text-xs opacity-40 ml-1">MARGIN</span></span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full transition-all duration-700 ease-out rounded-full",
                                                margin > 30 ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" :
                                                    margin > 10 ? "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]" :
                                                        "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                            )}
                                            style={{ width: `${Math.min(100, Math.max(0, margin))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                                        <LayoutGrid className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <h4 className="font-black text-sm dark:text-gray-200 uppercase tracking-[0.2em]">Stock Control</h4>
                                </div>

                                <div className="space-y-8">
                                    <div className="relative">
                                        <Input label="Initial Store Stock" type="number" {...register('stock')} error={errors.stock?.message} disabled={hasVariants} />
                                        {hasVariants && (
                                            <div className="absolute inset-0 bg-gray-50/90 dark:bg-gray-900/90 cursor-not-allowed flex items-center justify-center rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mt-5">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest">Delegated Tracking</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Managed via Variants Matrix</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Input label="Low Stock Threshold" type="number" {...register('minStockLevel')} error={errors.minStockLevel?.message} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Media Tab */}
                {activeTab === 'media' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
                                        <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm dark:text-gray-200 uppercase tracking-[0.2em]">Visual Portfolio</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 opacity-60">Upload high-resolution images for the catalogue</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 rounded-2xl h-12 font-black uppercase tracking-widest px-8"
                                >
                                    <Upload className="w-4 h-4 mr-2" /> Upload Media
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {/* Main Image */}
                                {watch('image') && (
                                    <div className="relative aspect-[4/5] rounded-[2rem] border-2 border-blue-500/30 overflow-hidden group shadow-xl">
                                        <img src={watch('image')} className="w-full h-full object-cover" alt="Main" />
                                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-lg backdrop-blur-md">Cover</div>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(0, true)}
                                            className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Additional Images */}
                                {(watch('images') || []).map((img, idx) => (
                                    <div key={idx} className="relative aspect-[4/5] rounded-[2rem] border border-gray-200 dark:border-gray-700 overflow-hidden group shadow-md hover:shadow-lg transition-all">
                                        <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx, false)}
                                            className="absolute top-3 right-3 bg-red-500 text-white p-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* Add More Button Placeholder */}
                                {!watch('image') && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="col-span-full py-20 rounded-[3rem] border-4 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-6 text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/30 hover:border-purple-300 transition-all group"
                                    >
                                        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:scale-110 group-hover:bg-purple-50 group-hover:text-purple-500 transition-all duration-500">
                                            <Upload className="w-12 h-12" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-sm font-black text-gray-400 uppercase tracking-[0.3em] group-hover:text-purple-600 transition-colors">Start Uploading</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase opacity-60">Drag and drop or click to browse</span>
                                        </div>
                                    </button>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Variants Tab */}
                {activeTab === 'variants' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                                        <Wand2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm dark:text-gray-200 uppercase tracking-[0.2em]">Inventory Matrix</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 opacity-60">Generate sizes and colors with one click.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer scale-125">
                                    <input type="checkbox" {...register('hasVariants')} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 transition-all shadow-inner"></div>
                                </label>
                            </div>

                            {!hasVariants ? (
                                <div className="py-20 text-center border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] opacity-60">
                                    <Wand2 className="w-12 h-12 text-gray-300 mx-auto mb-6" />
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em]">Variants Disabled</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">Enable the switch above to manage sizes and colors</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {/* Bulk Generator Interface */}
                                    <div className="bg-gray-50/50 dark:bg-gray-900/30 p-8 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 ring-[12px] ring-blue-500/5">
                                        <div className="flex items-center gap-2 mb-8 text-blue-600 dark:text-blue-400">
                                            <Wand2 className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Automated Row Generator</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1 mb-2 block">Standard Sizes</label>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {SIZES.map(s => (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                                                            className={cn(
                                                                "px-5 py-2.5 rounded-2xl text-[10px] font-black border transition-all duration-300 active:scale-90",
                                                                selectedSizes.includes(s)
                                                                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30 ring-4 ring-blue-500/10"
                                                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500"
                                                            )}
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 pl-1 mb-2 block">Color Palette</label>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {COLORS.map(c => (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])}
                                                            className={cn(
                                                                "px-5 py-2.5 rounded-2xl text-[10px] font-black border transition-all duration-300 active:scale-90",
                                                                selectedColors.includes(c)
                                                                    ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/30 ring-4 ring-blue-500/10"
                                                                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500"
                                                            )}
                                                        >
                                                            {c}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={generateVariants}
                                            disabled={selectedSizes.length === 0 || selectedColors.length === 0}
                                            className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] h-14 rounded-2xl font-black uppercase tracking-[0.2em] transition-all hover:-translate-y-1 active:scale-95 active:translate-y-0"
                                        >
                                            <Wand2 className="w-5 h-5 mr-3" />
                                            Generate {selectedSizes.length * selectedColors.length} Variation Rows
                                        </Button>
                                    </div>

                                    {/* Variant Rows */}
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 px-1 custom-scrollbar">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="grid grid-cols-12 gap-4 items-end bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm group hover:ring-4 hover:ring-blue-500/5 transition-all">
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-3 block ml-2">Size</label>
                                                    <div className="relative">
                                                        <select
                                                            {...register(`variants.${index}.size` as const)}
                                                            className="appearance-none w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 px-4 text-xs font-black dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                                        >
                                                            {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 mb-3 block ml-2">Color</label>
                                                    <div className="relative">
                                                        <select
                                                            {...register(`variants.${index}.color` as const)}
                                                            className="appearance-none w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 px-4 text-xs font-black dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                                        >
                                                            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="col-span-3">
                                                    <Input label="SKU Override" {...register(`variants.${index}.sku` as const)} />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input label="Stock" type="number" {...register(`variants.${index}.stock` as const)} />
                                                </div>
                                                <div className="col-span-2">
                                                    <Input label="Price (₹)" type="number" step="0.01" {...register(`variants.${index}.price` as const)} />
                                                </div>
                                                <div className="col-span-1 flex items-center justify-end pb-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(index)}
                                                        className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-2xl transition-all active:scale-90 hover:shadow-lg hover:shadow-red-500/20"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="w-full py-12 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] flex flex-col items-center justify-center gap-4 text-gray-300 hover:bg-blue-50/30 hover:border-blue-200 hover:text-blue-500 dark:hover:bg-blue-900/10 dark:hover:border-blue-800 transition-all group"
                                        >
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
                                                <Plus className="w-8 h-8" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-[0.3em]">Manual Entry</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl pt-8 pb-4 border-t dark:border-gray-800/50 z-50 rounded-b-3xl -mx-1 px-1">
                    <Button type="button" variant="ghost" className="rounded-2xl h-14 px-10 font-black text-gray-400 hover:text-gray-900 dark:hover:text-gray-100" onClick={() => onOpenChange(false)}>Discard</Button>
                    <Button type="submit" className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all">
                        {initialData ? 'Update Inventory' : 'Finalize & Save'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}
