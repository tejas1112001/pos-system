import { useEffect, useState } from 'react';
import { Truck, Calendar, ChevronRight, PackageCheck } from 'lucide-react';
import { MockService } from '../services/mockData';
import type { PurchaseOrder, Supplier, Product } from '../types';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

import { PurchaseModal } from '../components/purchases/PurchaseModal';

export default function Purchases() {
    const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        Promise.all([
            MockService.getPurchases(),
            MockService.getSuppliers(),
            MockService.getProducts()
        ]).then(([purchasesData, suppliersData, productsData]) => {
            setPurchases(purchasesData);
            setSuppliers(suppliersData);
            setProducts(productsData);
            setLoading(false);
        });
    }, []);

    const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || 'Unknown';
    const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Product';

    const handleAddPurchase = (data: any) => {
        const newPO: PurchaseOrder = {
            id: `PO-${Math.random().toString(36).substring(7).toUpperCase()}`,
            supplierId: data.supplierId,
            items: data.items,
            totalAmount: data.items.reduce((acc: number, item: any) => acc + (item.quantity * item.costPrice), 0),
            status: data.status,
            createdAt: new Date().toISOString(),
            receivedAt: data.status === 'received' ? new Date().toISOString() : undefined,
        };
        setPurchases([newPO, ...purchases]);
        setIsModalOpen(false);
    };

    if (loading) return <div className="p-8 dark:text-gray-400">Loading stock in history...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-gray-100 uppercase tracking-tight">Stock In <span className="text-blue-600">Operations</span></h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium uppercase tracking-widest opacity-60">Manage procurement & incoming logistics</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
                >
                    <PackageCheck className="w-5 h-5 mr-3" />
                    Record New Shipment
                </Button>
            </div>

            <div className="grid gap-8">
                {purchases.map(po => (
                    <div key={po.id} className="bg-white dark:bg-gray-800/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden group hover:ring-4 hover:ring-blue-500/5 transition-all">
                        <div className="p-8 flex flex-wrap items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <Truck className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex flex-col">
                                    <h4 className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">PO #{po.id.substring(0, 8).toUpperCase()}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{getSupplierName(po.supplierId)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-12">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Arrival Date</p>
                                        <p className="font-black text-gray-900 dark:text-gray-100 tabular-nums uppercase">{new Date(po.receivedAt || po.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-right">
                                    <div className="text-sm">
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">Investment</p>
                                        <p className="font-black text-xl text-gray-900 dark:text-gray-100 tabular-nums">₹{po.totalAmount.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    po.status === 'received' ? "bg-green-50 border-green-100 text-green-600 dark:bg-green-900/10 dark:border-green-800" :
                                        po.status === 'pending' ? "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/10 dark:border-amber-800" :
                                            "bg-red-50 border-red-100 text-red-600 dark:bg-red-900/10 dark:border-red-800"
                                )}>
                                    {po.status}
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {po.items.map((item, idx) => (
                                    <div key={idx} className="flex flex-col p-5 rounded-3xl border border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/10 hover:bg-white dark:hover:bg-gray-800/50 transition-all group/item shadow-sm">
                                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3 opacity-60 truncate">{getProductName(item.productId)}</span>
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums">{item.quantity}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter -mt-1">Units</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-[10px] font-black text-blue-500 uppercase tracking-tighter">Cost/Unit</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-gray-100">₹{item.costPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <PurchaseModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={handleAddPurchase}
            />
        </div>
    );
}
