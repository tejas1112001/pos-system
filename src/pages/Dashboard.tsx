import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { MockService, MOCK_PRODUCTS } from '../services/mockData';
import type { DashboardStats, Order } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useThemeStore } from '../store/useThemeStore';
import { Button } from '../components/ui/Button';

const StatCard = ({ title, value, icon: Icon, color, subtitle }: { title: string, value: string | number, icon: any, color: string, subtitle?: string }) => (
    <Card className="p-6 relative overflow-hidden group border-none shadow-xl bg-white dark:bg-gray-800 transition-all hover:-translate-y-1">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform ${color}`}>
            <Icon className="w-16 h-16" />
        </div>
        <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{title}</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100 tabular-nums">{value}</h3>
            {subtitle && (
                <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-tighter text-gray-500">
                    {subtitle}
                </div>
            )}
        </div>
    </Card>
);

interface SalesData {
    name: string;
    revenue: number;
    profit: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const { theme } = useThemeStore();

    useEffect(() => {
        Promise.all([
            MockService.getStats(),
            MockService.getOrders()
        ]).then(([statsData, ordersData]) => {
            setStats(statsData);
            processChartData(ordersData);
        });
    }, []);

    const processChartData = (orders: Order[]) => {
        const data = orders.slice(0, 7).reverse().map((order) => ({
            name: new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: order.total,
            profit: order.profit
        }));
        setSalesData(data);
    };

    if (!stats) return <div className="p-8 dark:text-gray-400">Loading dashboard stats...</div>;

    const chartColors = {
        text: theme === 'dark' ? '#9CA3AF' : '#6B7280',
        grid: theme === 'dark' ? '#374151' : '#E5E7EB',
        tooltipBg: theme === 'dark' ? '#1F2937' : '#FFFFFF',
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl lg:text-[2.5rem] font-black leading-tight tracking-tighter text-gray-900 dark:text-gray-100">
                        Retail <span className="text-blue-600">Performance</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Live Operations Hub • {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none rounded-full px-6 font-bold uppercase text-[10px] tracking-widest border-2">
                        System Logs
                    </Button>
                    <Button className="flex-1 md:flex-none rounded-full px-6 font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20">
                        Export Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.totalSales.toLocaleString()}`}
                    icon={DollarSign}
                    color="text-blue-600"
                    subtitle="12% vs last month"
                />
                <StatCard
                    title="Gross Profit"
                    value={`₹${stats.totalProfit.toLocaleString()}`}
                    icon={TrendingUp}
                    color="text-green-600"
                    subtitle="8.4% Net Yield"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="text-purple-600"
                    subtitle="2,143 Units Sold"
                />
                <StatCard
                    title="Stock Critical"
                    value={stats.lowStockCount}
                    icon={AlertTriangle}
                    color="text-red-500"
                    subtitle="Urgent Restock Needed"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 rounded-[2rem] border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Revenue & Profit Velocity (₹)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: chartColors.text, fontSize: 10, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: chartColors.text, fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '10px' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700/50">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center justify-between">
                            Inventory Shortage
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px]">Action Needed</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto max-h-[350px] p-6 space-y-4">
                        {MOCK_PRODUCTS.filter(p => p.stock < (p.minStockLevel || 10)).slice(0, 8).map(product => (
                            <div key={product.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 transition-all hover:border-red-200 dark:hover:border-red-900/30 group">
                                <div className="min-w-0 flex-1 mr-4">
                                    <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight truncate group-hover:text-red-500 transition-colors">{product.name}</p>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{product.sku}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-black tabular-nums ${product.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                            {product.stock}
                                        </p>
                                        <div className={`h-1.5 w-1.5 rounded-full ${product.stock === 0 ? 'bg-red-500 animate-ping' : 'bg-orange-500'}`} />
                                    </div>
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Left</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <div className="p-6 pt-0 mt-auto">
                        <Button
                            variant="ghost"
                            className="w-full text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 border border-dashed border-blue-200 dark:border-blue-900/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 h-10"
                            onClick={() => window.location.href = '/stock-in'}
                        >
                            Restock Catalog
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
