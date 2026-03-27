"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

export default function AdminDashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem("adminUser");
        if (userData) setUser(JSON.parse(userData));

        fetch("/api/admin/stats")
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const statCards = stats ? [
        { label: "Active Ring Styles", value: String(stats.ringStyles), color: "bg-blue-50 text-blue-600" },
        { label: "Metal Options", value: String(stats.metals), color: "bg-orange-50 text-orange-600" },
        { label: "Diamond Types", value: String(stats.diamonds), color: "bg-purple-50 text-purple-600" },
        { label: "Gold Rate", value: `₹${Number(stats.goldRate).toLocaleString("en-IN")}/g`, color: "bg-green-50 text-green-600" },
    ] : [];

    return (
        <div className="max-w-6xl mx-auto px-1 sm:px-0 pb-16">
            <div className="mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">Welcome back, {user?.name || "Admin"}</h1>
                <p className="text-sm sm:text-base text-gray-500 mt-1.5 sm:mt-2">Here is what is happening with your jewelry builder today.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {loading ? (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center text-gray-400 py-12 bg-white rounded-3xl border border-dashed border-gray-100">
                        <RefreshCw className="animate-spin mx-auto mb-3 opacity-20" size={32} />
                        <p className="font-medium">Loading analytics...</p>
                    </div>
                ) : (
                    statCards.map((stat) => (
                        <div key={stat.label} className="bg-white p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-all group">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1 group-hover:text-gray-500 transition-colors">{stat.label}</p>
                            <p className={`text-2xl sm:text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-12 sm:mt-20">
                <div className="flex items-center justify-between mb-6 sm:mb-8 px-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recommended Actions</h2>
                    <div className="h-1 w-12 bg-black rounded-full hidden sm:block"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <QuickActionCard
                        title="Update Gold Rate"
                        desc={stats ? `Current rate: ₹${Number(stats.goldRate).toLocaleString("en-IN")}` : "Loading..."}
                        action="Change Rate"
                        link="/admin/config"
                    />
                    <QuickActionCard
                        title="Add New Ring Style"
                        desc="Upload design and set base price"
                        action="Add Style"
                        link="/admin/ring-styles"
                    />
                    <QuickActionCard
                        title="Control Discounts"
                        desc={stats ? `Currently ${stats.discountPercent}% discount active` : "Loading..."}
                        action="Manage"
                        link="/admin/config"
                    />
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ title, desc, action, link }: any) {
    return (
        <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2 sm:mb-3">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-8 sm:mb-10 leading-relaxed font-medium">{desc}</p>
                <a
                    href={link}
                    className="inline-flex items-center gap-2 px-7 sm:px-9 py-2.5 sm:py-3.5 bg-gray-50 text-gray-900 rounded-full text-xs sm:text-sm font-bold group-hover:bg-black group-hover:text-white transition-all shadow-sm group-hover:shadow-lg"
                >
                    {action}
                </a>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 group-hover:bg-black/5 transition-colors duration-500 -z-0"></div>
        </div>
    );
}
