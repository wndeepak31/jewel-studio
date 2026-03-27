"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    Diamond,
    Settings,
    Layers,
    Weight,
    Globe,
    LogOut,
    LayoutDashboard,
    Gem,
    Hexagon,
    ImageIcon,
    Menu,
    X
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token && !pathname.includes("/login")) {
            router.push("/admin/login");
        } else {
            setAuthorized(true);
        }
    }, [pathname, router]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    if (!authorized && !pathname.includes("/login")) return null;
    if (pathname.includes("/login")) return <>{children}</>;

    const navItems = [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Ring Styles", href: "/admin/ring-styles", icon: Layers },
        { name: "Metals", href: "/admin/metals", icon: Weight },
        { name: "Diamonds", href: "/admin/diamonds", icon: Gem },
        { name: "Shapes", href: "/admin/shapes", icon: Hexagon },
        { name: "Settings", href: "/admin/settings", icon: Settings },
        { name: "Carats", href: "/admin/carats", icon: Diamond },
        { name: "Combinations", href: "/admin/combinations", icon: ImageIcon },
        { name: "Global Config", href: "/admin/config", icon: Globe },
    ];

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        router.push("/admin/login");
    };

    return (
        <div className="flex min-h-screen bg-[#faf7f3]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen">
                <div className="p-8">
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Studio Admin</h1>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? "bg-black text-white shadow-lg"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <Icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-50 bg-white">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <aside 
                className={`fixed inset-y-0 left-0 w-72 bg-white z-40 transform transition-transform duration-300 lg:hidden flex flex-col ${
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="p-6 flex items-center justify-between border-b border-gray-50">
                    <h1 className="text-lg font-bold text-gray-900">Studio Admin</h1>
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all ${isActive
                                    ? "bg-black text-white shadow-xl"
                                    : "text-gray-500 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon size={22} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-base font-bold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={22} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-20">
                    <h1 className="font-bold text-gray-900">Studio Admin</h1>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 bg-gray-50 rounded-xl text-black shadow-sm"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
