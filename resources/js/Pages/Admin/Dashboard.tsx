import AdminLayout from "@/Layouts/AdminLayout";
import { Card } from "@/components/retroui/Card";
import { Head, Link } from "@inertiajs/react";
import React from "react";
import { route } from "ziggy-js";

interface Activity {
    id: string;
    text: string;
    time: string;
}

interface DashboardProps {
    stats: {
        products: number;
        stores: number;
        staff: number;
        activeOrders: number;
    };
    recentActivities: Activity[];
}

export default function Dashboard({ stats, recentActivities: initialActivities }: DashboardProps) {
    const [activeOrdersCount, setActiveOrdersCount] = React.useState(stats.activeOrders);
    const [recentActivities, setRecentActivities] = React.useState(initialActivities);

    React.useEffect(() => {
        setActiveOrdersCount(stats.activeOrders);
        setRecentActivities(initialActivities);
    }, [stats.activeOrders, initialActivities]);

    React.useEffect(() => {
        // @ts-ignore
        const channel = window.Echo.channel('admin.orders')
            .listen('.order.placed', (e: { order: any }) => {
                setActiveOrdersCount(prev => prev + 1);
                setRecentActivities(prev => [{
                    id: 'order-' + e.order.id + '-' + Date.now(),
                    text: `Order #${e.order.id} placed by ${e.order.user.name}`,
                    time: 'Just now'
                }, ...prev].slice(0, 5));
            })
            .listen('.order.status.updated', (e: { orderId: number, status: string }) => {
                if (e.status === 'Done' || e.status === 'Cancelled') {
                    setActiveOrdersCount(prev => Math.max(0, prev - 1));
                } else if (e.status === 'Processing' || e.status === 'Out for Delivery') {
                    // It's possible an order was reactivated, but typically we just decrement on completion.
                }
            });

        return () => {
            // @ts-ignore
            window.Echo.leaveChannel('admin.orders');
        };
    }, []);

    return (
        <AdminLayout title="Admin Dashboard">
            <Head title="Admin Dashboard" />
            
            <div className="grid md:grid-cols-4 gap-8">
                <Card className="p-8 border-4 border-border shadow-shadow space-y-4 bg-[#ff90e8] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform">
                    <h2 className="text-xl font-heading uppercase italic text-black/80">Products</h2>
                    <p className="text-6xl font-heading text-black">{stats.products}</p>
                </Card>
                <Card className="p-8 border-4 border-border shadow-shadow space-y-4 bg-secondary hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform">
                    <h2 className="text-xl font-heading uppercase italic text-secondary-foreground/80">Locations</h2>
                    <p className="text-6xl font-heading text-secondary-foreground">{stats.stores}</p>
                </Card>
                <Card className="p-8 border-4 border-border shadow-shadow space-y-4 bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform">
                    <h2 className="text-xl font-heading uppercase italic text-foreground/60">Staff</h2>
                    <p className="text-6xl font-heading text-black">{stats.staff}</p>
                </Card>
                <Card className="p-8 border-4 border-border shadow-shadow space-y-4 bg-[#ffc900] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform">
                    <h2 className="text-xl font-heading uppercase italic text-black/80">Active Orders</h2>
                    <p className="text-6xl font-heading text-black animate-in fade-in zoom-in duration-300" key={activeOrdersCount}>{activeOrdersCount}</p>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
                <Card className="p-8 border-4 border-border shadow-shadow space-y-6 bg-white">
                    <h2 className="text-2xl font-heading uppercase italic border-b-2 border-border pb-2">Recent Activities</h2>
                    <div className="space-y-4 font-base text-sm opacity-60">
                        {recentActivities.length > 0 ? (
                            recentActivities.map(activity => (
                                <div key={activity.id} className="flex justify-between items-center animate-in fade-in slide-in-from-left-2 duration-300">
                                    <p>• {activity.text}</p>
                                    <span className="text-xs italic">{activity.time}</span>
                                </div>
                            ))
                        ) : (
                            <p className="italic text-center">No recent activities to display.</p>
                        )}
                    </div>
                </Card>
                <Card className="p-8 border-4 border-border shadow-shadow space-y-6 bg-white">
                    <h2 className="text-2xl font-heading uppercase italic border-b-2 border-border pb-2">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href={route('admin.products.index')} className="w-full">
                            <button className="w-full py-3 rounded-base border-2 border-border bg-main text-main-foreground font-heading uppercase text-xs shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">Add Product</button>
                        </Link>
                        <Link href={route('admin.staff.index')} className="w-full">
                            <button className="w-full py-3 rounded-base border-2 border-border bg-secondary text-secondary-foreground font-heading uppercase text-xs shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">New Staff</button>
                        </Link>
                        <Link href={route('admin.orders.index')} className="w-full col-span-2">
                            <button className="w-full py-3 rounded-base border-2 border-border bg-black text-white font-heading uppercase text-xs shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">Manage Active Orders</button>
                        </Link>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    );
}
