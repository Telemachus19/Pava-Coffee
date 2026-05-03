import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { cn } from "@/lib/utils";
import { route } from "ziggy-js";

interface ActiveOrder {
    id: number;
    status: string;
    ordered_at: string;
    session: {
        room: {
            room_number: string;
            store: { name: string };
        };
    };
    items: Array<{
        id: number;
        quantity: number;
        product: { name: string };
    }>;
}

interface HistoricalStay {
    id: number;
    join_time: string;
    leave_time: string;
    session: {
        id: number;
        room: {
            room_number: string;
            store: { name: string };
            room_type: { name: string };
        };
    };
}

interface DashboardProps {
    activeOrders: ActiveOrder[];
    history: {
        data: HistoricalStay[];
        links: any[];
    };
    filters: {
        from?: string;
        to?: string;
    };
}

export default function Dashboard() {
    const { activeOrders: initialActiveOrders, history, filters } = usePage<DashboardProps>().props;
    const [activeOrders, setActiveOrders] = React.useState<ActiveOrder[]>(initialActiveOrders);
    const { post, processing } = useForm();

    React.useEffect(() => {
        setActiveOrders(initialActiveOrders);
    }, [initialActiveOrders]);

    React.useEffect(() => {
        // @ts-ignore
        const channel = window.Echo.channel('admin.orders')
            .listen('.order.status.updated', (e: { orderId: number, status: string }) => {
                setActiveOrders(currentOrders => {
                    const newOrders = currentOrders.map(order => 
                        order.id === e.orderId ? { ...order, status: e.status } : order
                    );
                    // Filter out completed orders from the active view
                    return newOrders.filter(o => ['Processing', 'Out for Delivery'].includes(o.status));
                });
            });

        return () => {
            // @ts-ignore
            window.Echo.leaveChannel('admin.orders');
        };
    }, []);

    const handleCancel = (orderId: number) => {
        if (confirm("Are you sure you want to cancel this order?")) {
            post(route('orders.cancel', { order: orderId }));
        }
    };

    return (
        <>
            <Head title="Order Dashboard" />
            
            <div className="min-h-screen bg-secondary-background">
                <header className="border-b-2 border-border bg-main p-4 flex justify-between items-center shadow-shadow">
                    <Link href="/" className="font-heading text-2xl tracking-tighter text-main-foreground italic uppercase">
                        PAVA COFFEE
                    </Link>
                    <Link href="/" className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase">
                        Book a Room
                    </Link>
                </header>

                <main className="max-w-6xl mx-auto p-6 space-y-12">
                    <section className="space-y-6">
                        <h1 className="text-4xl font-heading uppercase italic border-b-4 border-main inline-block">
                            Your Activity
                        </h1>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Active Orders */}
                            <div className="lg:col-span-1 space-y-4">
                                <h2 className="text-xl font-heading uppercase">Active Orders</h2>
                                {activeOrders.length === 0 ? (
                                    <Card className="p-8 border-2 border-border border-dashed text-center opacity-40 italic font-base">
                                        No active orders.
                                    </Card>
                                ) : (
                                    activeOrders.map(order => (
                                        <Card key={order.id} className="p-4 border-2 border-border shadow-shadow space-y-4 bg-white">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-heading text-sm uppercase text-main">Order #{order.id}</p>
                                                    <p className="font-base text-xs text-foreground/60">{order.session.room.store.name} • Room {order.session.room.room_number}</p>
                                                </div>
                                                <Badge className={cn(
                                                    "border-2 border-border font-heading text-[10px]",
                                                    order.status === 'Processing' ? "bg-yellow-400" : "bg-blue-400"
                                                )}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                            <div className="space-y-1">
                                                {order.items.map(item => (
                                                    <p key={item.id} className="font-base text-sm">{item.quantity}x {item.product.name}</p>
                                                ))}
                                            </div>
                                            {order.status === 'Processing' && (
                                                <Button 
                                                    variant="secondary" 
                                                    className="w-full h-8 text-xs border-red-500 text-red-500 hover:bg-red-50"
                                                    onClick={() => handleCancel(order.id)}
                                                    disabled={processing}
                                                >
                                                    Cancel Order
                                                </Button>
                                            )}
                                        </Card>
                                    ))
                                )}
                            </div>

                            {/* History */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-heading uppercase">Stay History</h2>
                                    <div className="flex gap-2">
                                        <input 
                                            type="date" 
                                            className="border-2 border-border rounded-base px-2 py-1 text-xs font-base shadow-shadow"
                                            defaultValue={filters.from}
                                        />
                                        <span className="font-heading self-center">-</span>
                                        <input 
                                            type="date" 
                                            className="border-2 border-border rounded-base px-2 py-1 text-xs font-base shadow-shadow"
                                            defaultValue={filters.to}
                                        />
                                    </div>
                                </div>

                                {history.data.length === 0 ? (
                                    <Card className="p-12 border-2 border-border border-dashed text-center opacity-40 italic font-base">
                                        No historical stays found.
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {history.data.map(stay => (
                                            <Card key={stay.id} className="p-4 border-2 border-border shadow-shadow flex flex-col md:flex-row justify-between items-center bg-white gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-main/10 border-2 border-main p-3 rounded-base font-heading text-main">
                                                        S-{stay.session.id}
                                                    </div>
                                                    <div>
                                                        <p className="font-heading uppercase">{stay.session.room.store.name}</p>
                                                        <p className="font-base text-xs text-foreground/60">Room #{stay.session.room.room_number} • {stay.session.room.room_type.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-heading text-sm">{new Date(stay.join_time).toLocaleDateString()}</p>
                                                    <p className="font-base text-xs text-foreground/60">
                                                        {new Date(stay.join_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                                        {new Date(stay.leave_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <Link href={route('session.checkout', { session: stay.session.id })}>
                                                    <Button variant="outline" className="h-8 text-xs uppercase border-2">
                                                        View Receipt
                                                    </Button>
                                                </Link>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
