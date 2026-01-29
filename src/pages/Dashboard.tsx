import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { MockService, MOCK_PRODUCTS } from '../services/mockData';
import type { DashboardStats, Order } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useThemeStore } from '../store/useThemeStore';
import { Button } from '../components/ui/Button';

const StatCard = ({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: any, color: string, bg: string }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-gray-100">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${bg} ${color} bg-opacity-10 dark:bg-opacity-20`}>
                <Icon className="w-6 h-6" />
            </div>
        </CardContent>
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
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Retail Performance</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time tracking of revenue, profit, and inventory health.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Export Report</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    bg="bg-blue-100"
                    color="text-blue-600"
                />
                <StatCard
                    title="Gross Profit"
                    value={`$${stats.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                    bg="bg-green-100"
                    color="text-green-600"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    bg="bg-purple-100"
                    color="text-purple-600"
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={stats.lowStockCount}
                    icon={AlertTriangle}
                    bg="bg-orange-100"
                    color="text-orange-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-wider font-bold text-gray-400">Revenue & Profit Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: chartColors.text, fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-wider font-bold text-gray-400">Inventory Shortage</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto max-h-[300px] space-y-4">
                        {MOCK_PRODUCTS.filter(p => p.stock < p.minStockLevel).slice(0, 8).map(product => (
                            <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                                <div className="min-w-0 flex-1 mr-4">
                                    <p className="text-sm font-bold truncate dark:text-gray-200">{product.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono uppercase">{product.sku}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${product.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                        {product.stock}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase">Stock</p>
                                </div>
                            </div>
                        ))}
                        <Button variant="ghost" className="w-full text-blue-600 dark:text-blue-400 text-sm mt-2" onClick={() => window.location.href = '/purchases'}>
                            View All & Restock
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
