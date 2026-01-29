import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '../ui/Dialog';
import type { Supplier } from '../../types';
import { useEffect } from 'react';
import { Truck } from 'lucide-react';

const supplierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Invalid phone number'),
    address: z.string().min(1, 'Address is required'),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: SupplierFormValues) => void;
    initialData?: Supplier;
}

export function SupplierModal({ open, onOpenChange, onSubmit, initialData }: SupplierModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            ...initialData,
        },
    });

    useEffect(() => {
        if (open) {
            reset(initialData || {
                name: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
            });
        }
    }, [open, initialData, reset]);

    const handleFormSubmit = (data: SupplierFormValues) => {
        onSubmit(data);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black uppercase tracking-tight">
                            {initialData ? 'Edit Strategic Partner' : 'Establish New Partner'}
                        </span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Vendor & Supply Chain Registration</span>
                    </div>
                </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 my-6">
                <div className="bg-white dark:bg-gray-800/40 p-8 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Business Name"
                            placeholder="e.g. Apex Textiles Ltd."
                            {...register('name')}
                            error={errors.name?.message}
                        />
                        <Input
                            label="Contact Representative"
                            placeholder="e.g. John Doe"
                            {...register('contactPerson')}
                            error={errors.contactPerson?.message}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Corporate Email"
                            placeholder="vendor@company.com"
                            type="email"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <Input
                            label="Phone Registry"
                            placeholder="+91 XXXXX XXXXX"
                            {...register('phone')}
                            error={errors.phone?.message}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Headquarters Address</label>
                        <textarea
                            {...register('address')}
                            placeholder="Enter full business address..."
                            className="w-full min-h-[100px] rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-gray-100"
                        />
                        {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">{errors.address.message}</p>}
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-2xl h-14 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
                    >
                        {initialData ? 'Update Partnership' : 'Seal Partnership'}
                    </Button>
                </DialogFooter>
            </form>
        </Dialog>
    );
}
