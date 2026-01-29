import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, FileText, Settings, LogOut, Sun, Moon, Bell, Truck, History, BarChartBig, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export default function MainLayout() {
    const { logout, user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
    }, [isCollapsed]);

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
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden transition-colors duration-200">
            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-950/40 z-40 lg:hidden backdrop-blur-[2px] animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                    isCollapsed ? "lg:w-20" : "lg:w-64"
                )}
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    {(!isCollapsed || isSidebarOpen) && (
                        <h1 className="text-xl font-black tracking-tighter text-blue-600 dark:text-blue-500 animate-in slide-in-from-left-4 duration-500">
                            POS<span className="text-gray-900 dark:text-white">PRO</span>
                        </h1>
                    )}
                    {isCollapsed && !isSidebarOpen && (
                        <div className="mx-auto w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">P</div>
                    )}
                    <button
                        className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto no-scrollbar py-6">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsSidebarOpen(false)}
                            title={isCollapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 active-nav-glow"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn("shrink-0 transition-transform group-hover:scale-110", isCollapsed && !isSidebarOpen ? "w-6 h-6 mx-auto" : "w-5 h-5")} />
                                    {(!isCollapsed || isSidebarOpen) && (
                                        <span className="text-[13px] font-bold tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                                            {item.label}
                                        </span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className={cn("hidden lg:block mb-4 transition-all duration-300", isCollapsed ? "px-0" : "px-2")}>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40 transition-all shadow-sm group"
                        >
                            {isCollapsed ? <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" /> : (
                                <div className="flex items-center gap-2 w-full px-1">
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Collapse Menu</span>
                                </div>
                            )}
                        </button>
                    </div>

                    <div className={cn("flex items-center gap-3 mb-4 px-2 overflow-hidden transition-all", isCollapsed && !isSidebarOpen ? "justify-center" : "")}>
                        <img
                            src={user?.avatar || "https://ui-avatars.com/api/?name=Admin&background=2563eb&color=fff&bold=true"}
                            alt="User"
                            className="w-9 h-9 rounded-xl border-2 border-white dark:border-gray-800 shadow-sm shrink-0"
                        />
                        {(!isCollapsed || isSidebarOpen) && (
                            <div className="text-[11px] truncate animate-in fade-in duration-500">
                                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate">{user?.name || 'Admin User'}</p>
                                <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[9px] tracking-widest opacity-60">{user?.role || 'Master Administrator'}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => logout()}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all group",
                            isCollapsed && !isSidebarOpen ? "justify-center px-0" : ""
                        )}
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        {(!isCollapsed || isSidebarOpen) && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsSidebarOpen(true);
                                } else {
                                    setIsCollapsed(!isCollapsed);
                                }
                            }}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none mb-1">Session Protocol</p>
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                                Authorized: {user?.name?.split(' ')[0]}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <button
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Live Terminal
                        </button>

                        <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden lg:block" />

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all active:scale-95"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>

                        <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl relative active:scale-95 transition-all">
                            <span className="sr-only">Notifications</span>
                            <div className="w-2 h-2 bg-red-500 rounded-full absolute top-2 right-2 border-2 border-white dark:border-gray-900 animate-bounce"></div>
                            <Bell className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-gray-950/20">
                    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
