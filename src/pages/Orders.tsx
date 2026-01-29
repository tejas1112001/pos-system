import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { MockService } from '../services/mockData';
import type { Order } from '../types';
import { Check, XCircle, Search, Filter, Download, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Dialog, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { cn } from '../utils/cn';

const columnHelper = createColumnHelper<Order>();

const columns = [
    columnHelper.accessor('id', {
        header: 'Transaction ID',
        cell: info => <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">#{info.getValue()}</span>,
    }),
    columnHelper.accessor('createdAt', {
        header: 'Date & Time',
        cell: info => <span className="text-gray-600 dark:text-gray-400 text-xs">{new Date(info.getValue()).toLocaleString()}</span>,
    }),
    columnHelper.accessor('items', {
        header: 'Qty',
        cell: info => <span className="font-medium text-gray-900 dark:text-gray-100">{info.getValue().reduce((acc, item) => acc + item.quantity, 0)}</span>,
    }),
    columnHelper.accessor('total', {
        header: 'Amount',
        cell: info => <span className="font-bold text-gray-900 dark:text-gray-100">${info.getValue().toFixed(2)}</span>,
    }),
    columnHelper.accessor('profit', {
        header: 'Profit',
        cell: info => <span className="font-medium text-green-600 dark:text-green-400">${info.getValue().toFixed(2)}</span>,
    }),
    columnHelper.accessor('paymentMethod', {
        header: 'Method',
        cell: info => <span className="capitalize text-xs font-medium text-gray-500 dark:text-gray-400">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
            const status = info.getValue() as string;
            return (
                <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit",
                    status === 'completed'
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                )}>
                    {status === 'completed' ? <Check className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    <span>{status}</span>
                </div>
            )
        },
    }),
];

export default function Orders() {
    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        MockService.getOrders().then(d => {
            setData(d);
            setLoading(false);
        });
    }, []);

    const filteredData = data.filter(order =>
        order.id.toLowerCase().includes(search.toLowerCase())
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (loading) return <div className="p-8 dark:text-gray-400">Loading history...</div>;

    const totalPeriodRevenue = filteredData.reduce((acc, o) => acc + o.total, 0);
    const totalPeriodProfit = filteredData.reduce((acc, o) => acc + o.profit, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold dark:text-gray-100">Sales History</h1>
                    <p className="text-gray-500 text-sm mt-1">Review your store's transactions and profitability.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Filtered Revenue</p>
                    <h3 className="text-xl font-bold dark:text-gray-100 mt-1">${totalPeriodRevenue.toFixed(2)}</h3>
                </Card>
                <Card className="p-4 bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Filtered Profit</p>
                    <h3 className="text-xl font-bold dark:text-gray-100 mt-1">${totalPeriodProfit.toFixed(2)}</h3>
                </Card>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by Transaction ID..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 font-bold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(row.original)} className="opacity-0 group-hover:opacity-100">
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredData.length === 0 && (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400 italic">
                        No transactions found matching your search.
                    </div>
                )}
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                {selectedOrder && (
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                                <span>Order Details</span>
                                <span className="text-xs font-mono text-gray-400 font-normal">#{selectedOrder.id}</span>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="my-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">Date</p>
                                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Payment Method</p>
                                    <p className="font-medium capitalize">{selectedOrder.paymentMethod}</p>
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden dark:border-gray-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 font-medium">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Item</th>
                                            <th className="px-4 py-2 text-center">Qty</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{item.sku}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Tax (10%)</span>
                                    <span>${selectedOrder.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700">
                                    <span>Total</span>
                                    <span className="text-blue-600 dark:text-blue-400">${selectedOrder.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600 text-xs font-medium pt-1">
                                    <span>Profit from this sale</span>
                                    <span>+${selectedOrder.profit.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t dark:border-gray-700 pt-4">
                            <Button variant="outline" onClick={() => window.print()}>Print Receipt</Button>
                            <Button onClick={() => setSelectedOrder(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
