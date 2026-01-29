import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings, LogOut, Sun, Moon, Bell, Truck, History, BarChartBig } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useEffect } from 'react';
import { cn } from '../../utils/cn';

export default function MainLayout() {
    const { logout, user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/pos', icon: ShoppingCart, label: 'POS Terminal' },
        { to: '/products', icon: Package, label: 'Products' },
        { to: '/suppliers', icon: Truck, label: 'Suppliers' },
        { to: '/purchases', icon: History, label: 'Stock In' },
        { to: '/reports', icon: BarChartBig, label: 'Reports' },
        { to: '/orders', icon: FileText, label: 'Sales History' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">POS<span className="text-gray-800 dark:text-gray-200">System</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                                    isActive
                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100"
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <img src={user?.avatar || "https://ui-avatars.com/api/?name=User"} alt="User" className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user?.name || 'Guest'}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.role || 'Access'}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-200">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Welcome back, {user?.name?.split(' ')[0]}</h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>
                        <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative">
                            <span className="sr-only">Notifications</span>
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute top-1 right-1 border-2 border-white dark:border-gray-800"></div>
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
