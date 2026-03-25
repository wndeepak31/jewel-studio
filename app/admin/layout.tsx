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
    ImageIcon
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false);
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
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen">
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

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-auto">
                {children}
            </main>
        </div>
    );
}
