"use client";

import { useEffect, useState } from "react";

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
        <div className="max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Admin"}</h1>
                <p className="text-gray-500 mt-1">Here is what is happening with your jewelry builder today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-4 text-center text-gray-400 py-8">Loading stats...</div>
                ) : (
                    statCards.map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
                            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-12">
                <h2 className="text-xl font-bold mb-6">Quick Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-6">{desc}</p>
            <a
                href={link}
                className="inline-block px-6 py-2 bg-gray-50 text-gray-900 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition-all"
            >
                {action}
            </a>
        </div>
    );
}
