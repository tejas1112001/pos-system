import { useState } from 'react';
import { Check, CreditCard, Banknote, Smartphone, Printer, Layers } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle } from './Dialog';
import { Button } from './Button';
import { useCartStore } from '../../store/useCartStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { cn } from '../../utils/cn';

interface CheckoutModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'digital' | 'split';

export function CheckoutModal({ open, onOpenChange, onSuccess }: CheckoutModalProps) {
    const { total, clearCart, items } = useCartStore();
    const { settings } = useSettingsStore();
    const [step, setStep] = useState<'payment' | 'success'>('payment');
    const [method, setMethod] = useState<PaymentMethod | null>(null);
    const [loading, setLoading] = useState(false);
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [transactionDate, setTransactionDate] = useState<string | null>(null);

    const subtotal = total();
    const totalCost = items.reduce((sum, item) => {
        let cost = item.costPrice;
        if (item.selectedVariantId && item.variants) {
            const variant = item.variants.find(v => v.id === item.selectedVariantId);
            if (variant?.costPrice !== undefined) cost = variant.costPrice;
        }
        return sum + (cost * item.quantity);
    }, 0);
    const tax = subtotal * (settings.taxRate / 100);
    const grandTotal = subtotal + tax;
    const profit = grandTotal - totalCost - tax;

    const handlePayment = async () => {
        if (!method) return;
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real app, we would send the order to the backend here
        const orderId = `TRX-${Math.floor(Math.random() * 1000000)}`;
        const orderDate = new Date().toISOString();

        const orderData = {
            id: orderId,
            items,
            subtotal,
            tax,
            total: grandTotal,
            profit,
            paymentMethod: method,
            createdAt: orderDate,
            status: 'completed'
        };
        console.log('Order Processed:', orderData);

        setTransactionId(orderId);
        setTransactionDate(orderDate);
        setLoading(false);
        setStep('success');
    };

    const handleClose = () => {
        clearCart();
        setStep('payment');
        setMethod(null);
        onSuccess();
        onOpenChange(false);
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl">
            {step === 'payment' ? (
                <>
                    <DialogHeader>
                        <DialogTitle>Details & Payment</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-8 my-6">
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-2">Order Summary</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {items.map(item => {
                                    const variant = item.selectedVariantId && item.variants
                                        ? item.variants.find(v => v.id === item.selectedVariantId)
                                        : null;
                                    const displayPrice = variant?.price ?? item.price;
                                    const itemId = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;

                                    return (
                                        <div key={itemId} className="flex justify-between text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 dark:text-gray-200 font-medium">
                                                    {item.name}
                                                    {variant && <span className="ml-2 text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">{variant.name}</span>}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} x {settings.currency}{displayPrice.toFixed(2)}</span>
                                            </div>
                                            <span className="font-medium dark:text-gray-100">{settings.currency}{(displayPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>{settings.currency}{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>Tax ({settings.taxRate}%)</span>
                                    <span>{settings.currency}{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-blue-600 dark:text-blue-400 border-t dark:border-gray-700 pt-2">
                                    <span>Total</span>
                                    <span>{settings.currency}{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-2">Payment Method</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'cash', label: 'Cash Payment', icon: Banknote },
                                    { id: 'card', label: 'Credit Card', icon: CreditCard },
                                    { id: 'digital', label: 'E-Wallet / QR', icon: Smartphone },
                                    { id: 'split', label: 'Split / Multiple', icon: Layers },
                                ].map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMethod(m.id as PaymentMethod)}
                                        className={cn(
                                            "flex items-center p-4 rounded-xl border-2 transition-all",
                                            method === m.id
                                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                                : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                                        )}
                                    >
                                        <m.icon className="w-6 h-6 mr-3" />
                                        <span className="font-medium">{m.label}</span>
                                        {method === m.id && <Check className="w-5 h-5 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button
                            size="lg"
                            className="w-48 shadow-lg dark:shadow-blue-900/20"
                            disabled={!method || loading}
                            onClick={handlePayment}
                        >
                            {loading ? 'Processing...' : `Charge ${settings.currency}${grandTotal.toFixed(2)}`}
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Payment Successful!</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Transaction ID: #{transactionId}</p>

                    <div className="bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 max-w-sm mx-auto mb-8 text-left font-mono">
                        <div className="text-center border-b border-dashed border-gray-300 dark:border-gray-700 pb-4 mb-4">
                            <h4 className="font-bold dark:text-gray-200 uppercase">{settings.storeName}</h4>
                            <p className="text-[10px] text-gray-400">{settings.storeAddress}</p>
                            <p className="text-[10px] text-gray-400">{settings.storePhone}</p>
                            <div className="mt-2 text-[10px] text-gray-600 font-bold">{settings.receiptHeader}</div>
                            <p className="text-[10px] text-gray-500 mt-1">{transactionDate ? new Date(transactionDate).toLocaleString() : ''}</p>
                        </div>
                        <div className="space-y-2 text-xs mb-4">
                            {items.map(item => {
                                const variant = item.selectedVariantId && item.variants ? item.variants.find(v => v.id === item.selectedVariantId) : null;
                                const displayPrice = variant?.price ?? item.price;
                                return (
                                    <div key={item.id + (item.selectedVariantId || '')} className="flex justify-between">
                                        <div className="flex flex-col">
                                            <span className="dark:text-gray-300">{item.name}</span>
                                            {variant && <span className="text-[8px] text-gray-500">{variant.name}</span>}
                                        </div>
                                        <span className="dark:text-gray-300">x{item.quantity} {settings.currency}{(displayPrice * item.quantity).toFixed(2)}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-4 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 uppercase">Subtotal</span>
                                <span className="dark:text-gray-200">{settings.currency}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 uppercase font-bold text-[10px]">Tax ({settings.taxRate}%)</span>
                                <span className="dark:text-gray-200">{settings.currency}{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2">
                                <span className="dark:text-gray-100 uppercase">Total</span>
                                <span className="dark:text-gray-100">{settings.currency}{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="mt-6 text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            {settings.receiptFooter}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={() => window.print()}>
                            <Printer className="w-4 h-4 mr-2" />
                            Print Receipt
                        </Button>
                        <Button onClick={handleClose}>
                            New Order
                        </Button>
                    </div>
                </div>
            )}
        </Dialog>
    );
}
