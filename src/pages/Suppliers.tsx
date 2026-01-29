import { useEffect, useState } from 'react';
import { Truck, Phone, Mail, MapPin, User, Plus, Search } from 'lucide-react';
import { MockService } from '../services/mockData';
import type { Supplier } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SupplierModal } from '../components/suppliers/SupplierModal';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();

    useEffect(() => {
        MockService.getSuppliers().then(data => {
            setSuppliers(data);
            setLoading(false);
        });
    }, []);

    const handleAddSupplier = (data: any) => {
        const newSupplier: Supplier = {
            ...data,
            id: `SUP-${Math.random().toString(36).substring(7).toUpperCase()}`,
        };
        setSuppliers([newSupplier, ...suppliers]);
    };

    const handleUpdateSupplier = (data: any) => {
        setSuppliers(suppliers.map(s => s.id === editingSupplier?.id ? { ...s, ...data } : s));
        setEditingSupplier(undefined);
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-8 dark:text-gray-400">Loading procurement partners...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black dark:text-gray-100 uppercase tracking-tight">Supply Chain <span className="text-blue-600">Partners</span></h1>
                    <p className="text-gray-500 text-[10px] mt-1 font-black uppercase tracking-[0.2em] opacity-60">Strategic vendor relationship & procurement directory</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingSupplier(undefined);
                        setIsModalOpen(true);
                    }}
                    className="w-full md:w-auto h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
                >
                    <Plus className="w-5 h-5 mr-3" />
                    Enlist Partner
                </Button>
            </div>

            {/* 2. Intelligent Search */}
            <div className="bg-white dark:bg-gray-800/40 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm max-w-xl group focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        placeholder="Scan for name or key agent..."
                        className="pl-12 border-none bg-transparent shadow-none h-12 font-black uppercase tracking-widest text-[10px] focus-visible:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* 3. Supplier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSuppliers.map(supplier => (
                    <div key={supplier.id} className="bg-white dark:bg-gray-800/40 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:ring-4 hover:ring-blue-500/5 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

                        <div className="flex justify-between items-start mb-8">
                            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:border-blue-200 transition-colors">
                                <Truck className="w-7 h-7" />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setEditingSupplier(supplier);
                                    setIsModalOpen(true);
                                }}
                                className="rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
                            >
                                Edit Profile
                            </Button>
                        </div>

                        <div className="space-y-1 mb-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight truncate">{supplier.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 opacity-60">Active Partner</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/10 p-4 rounded-2xl mb-8 border border-gray-100 dark:border-gray-700/30">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xs">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-tighter">Primary Agent</span>
                                <span className="text-[11px] font-black uppercase text-gray-900 dark:text-gray-100">{supplier.contactPerson}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/10 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-colors">
                                <Phone className="w-3.5 h-3.5 text-blue-500 mb-2" />
                                <span className="text-[10px] font-black text-gray-900 dark:text-gray-100 tabular-nums">{supplier.phone}</span>
                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">Direct Line</span>
                            </div>
                            <div className="flex flex-col p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/10 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-colors">
                                <Mail className="w-3.5 h-3.5 text-blue-500 mb-2 transition-transform group-hover:rotate-12" />
                                <span className="text-[9px] font-black text-gray-900 dark:text-gray-100 truncate">{supplier.email}</span>
                                <span className="text-[8px] font-black uppercase text-gray-400 tracking-widest mt-1">Registry</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-widest truncate">{supplier.address}</p>
                        </div>
                    </div>
                ))}
            </div>

            <SupplierModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSubmit={editingSupplier ? handleUpdateSupplier : handleAddSupplier}
                initialData={editingSupplier}
            />
        </div>
    );
}
