import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Package, PieChart as PieIcon, ArrowUpRight, Printer, Share2 } from 'lucide-react';
import { MockService, MOCK_PRODUCTS } from '../services/mockData';
import type { Order } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useThemeStore } from '../store/useThemeStore';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Reports() {
    const { theme } = useThemeStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        MockService.getOrders().then(data => {
            setOrders(data);
            setLoading(false);
        });
    }, []);

    // Analytics Calculations
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const totalProfit = orders.reduce((sum, o) => sum + o.profit, 0);

    // Category Distribution (Data processed but currently hidden in favor of Payment Analytics)
    const categoryDataMap: Record<string, number> = {};
    orders.forEach(o => {
        o.items.forEach(item => {
            categoryDataMap[item.category] = (categoryDataMap[item.category] || 0) + (item.price * item.quantity);
        });
    });

    // Payment Method Distribution
    const paymentMap: Record<string, { revenue: number, count: number }> = {
        'cash': { revenue: 0, count: 0 },
        'card': { revenue: 0, count: 0 },
        'digital': { revenue: 0, count: 0 },
        'split': { revenue: 0, count: 0 }
    };
    orders.forEach(o => {
        if (paymentMap[o.paymentMethod]) {
            paymentMap[o.paymentMethod].revenue += o.total;
            paymentMap[o.paymentMethod].count += 1;
        }
    });

    const paymentLabels: Record<string, string> = {
        'cash': 'Cash Payment',
        'card': 'Credit Card',
        'digital': 'Online / QR',
        'split': 'Split Payment'
    };

    const paymentData = Object.entries(paymentMap).map(([key, data]) => ({
        name: paymentLabels[key],
        value: data.revenue,
        count: data.count,
        key
    })).filter(d => d.value > 0);

    // Top Selling Products
    const productSalesMap: Record<string, { name: string, qty: number, revenue: number, profit: number }> = {};
    orders.forEach(o => {
        o.items.forEach(item => {
            if (!productSalesMap[item.id]) {
                productSalesMap[item.id] = { name: item.name, qty: 0, revenue: 0, profit: 0 };
            }
            productSalesMap[item.id].qty += item.quantity;
            productSalesMap[item.id].revenue += (item.price * item.quantity);
            productSalesMap[item.id].profit += (item.price - item.costPrice) * item.quantity;
        });
    });
    const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // Inventory Valuation
    const totalCostValue = MOCK_PRODUCTS.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
    const totalSaleValue = MOCK_PRODUCTS.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const potentialProfit = totalSaleValue - totalCostValue;

    if (loading) return <div className="p-8 dark:text-gray-400">Loading comprehensive analytics...</div>;

    const chartColors = {
        text: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        grid: theme === 'dark' ? '#374151' : '#E5E7EB',
        tooltipBg: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold dark:text-gray-100">Business Reports</h1>
                    <p className="text-gray-500 text-sm mt-1">Deep dive into your store's sales, profit margins, and inventory value.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button size="sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Print Page
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 relative overflow-hidden group border-none shadow-xl shadow-blue-500/5 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-16 h-16 text-blue-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Revenue</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1 tabular-nums">₹{totalSales.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-[10px] text-green-600 font-black uppercase tracking-tighter">
                        <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                        12.5% vs Last Period
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group border-none shadow-xl shadow-green-500/5 bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/10">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-16 h-16 text-green-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Gross Profit</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1 tabular-nums">₹{totalProfit.toLocaleString()}</h3>
                    <div className="mt-4 flex items-center text-[10px] text-green-600 font-black uppercase tracking-tighter">
                        <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                        8.2% margin yield
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group border-none shadow-xl shadow-purple-500/5 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/10">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Package className="w-16 h-16 text-purple-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inventory Assets</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 mt-1 tabular-nums">₹{totalCostValue.toLocaleString()}</h3>
                    <p className="text-[10px] text-gray-400 mt-4 font-black uppercase tracking-tighter">Untapped Profit: <span className="text-green-500 italic">₹{potentialProfit.toLocaleString()}</span></p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="rounded-[2rem] border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                            <PieIcon className="w-4 h-4 text-blue-500" />
                            Payment Method Intelligence
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-[280px] p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={paymentData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {paymentData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="p-8 flex flex-col justify-center space-y-4 bg-gray-50/30 dark:bg-gray-900/10">
                                {paymentData.map((p, i) => (
                                    <div key={p.name} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                            <div>
                                                <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{p.name}</p>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{p.count} Transactions</p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-gray-900 dark:text-gray-100 tabular-nums">₹{p.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">High-Velocity Products</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {topProducts.map((p, i) => (
                            <div key={p.name} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xs font-black text-blue-600 shadow-sm">
                                        0{i + 1}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight truncate max-w-[150px]">{p.name}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{p.qty} Units Sold</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">₹{p.revenue.toLocaleString()}</p>
                                    <p className="text-[9px] text-green-500 font-black uppercase tracking-tighter">Profit: ₹{p.profit.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[2rem] border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700/50">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Daily Financial Performance (₹)</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] p-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[...orders].slice(0, 15).reverse().map(o => ({ date: new Date(o.createdAt).toLocaleDateString(), revenue: o.total, profit: o.profit }))}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: chartColors.text, fontSize: 9, fontWeight: 900 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: chartColors.text, fontSize: 9, fontWeight: 900 }}
                                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                            />
                            <Tooltip
                                cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                                contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px' }}
                            />
                            <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                            <Bar dataKey="profit" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
