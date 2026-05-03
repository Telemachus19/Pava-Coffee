import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { Head, useForm } from "@inertiajs/react";
import React from "react";
import { route } from "ziggy-js";
import { cn } from "@/lib/utils";

interface OrderItem {
    id: number;
    quantity: number;
    product: { name: string };
}

interface Order {
    id: number;
    status: string;
    ordered_at: string;
    user: { name: string };
    session: {
        room: { room_number: string };
    };
    items: OrderItem[];
}

interface OrdersProps {
    orders: Order[];
}

export default function Orders({ orders: initialOrders }: OrdersProps) {
    const [orders, setOrders] = React.useState<Order[]>(initialOrders);
    const { patch, processing } = useForm();

    React.useEffect(() => {
        setOrders(initialOrders);
    }, [initialOrders]);

    React.useEffect(() => {
        // @ts-ignore
        const channel = window.Echo.channel('admin.orders')
            .listen('.order.placed', (e: { order: Order }) => {
                console.log('Order Placed Received:', e);
                setOrders(currentOrders => [e.order, ...currentOrders]);
            })
            .listen('.order.status.updated', (e: { orderId: number, status: string }) => {
                console.log('Order Status Updated Received:', e);
                setOrders(currentOrders => {
                    // If the new status means the order is no longer active (Done, Cancelled),
                    // we might want to remove it or just update it. Let's update its status.
                    const newOrders = currentOrders.map(order => 
                        order.id === e.orderId ? { ...order, status: e.status } : order
                    );
                    // Filter out completed orders to keep active list clean
                    return newOrders.filter(o => ['Processing', 'Out for Delivery'].includes(o.status));
                });
            });

        return () => {
            // @ts-ignore
            window.Echo.leaveChannel('admin.orders');
        };
    }, []);

    const updateStatus = (orderId: number, status: string) => {
        patch(route("admin.orders.update-status", { order: orderId, status }), {
            preserveScroll: true
        });
    };

    return (
        <AdminLayout title="Active Orders">
            <Head title="Admin - Orders" />

            <div className="space-y-8">
                {orders.length === 0 ? (
                    <Card className="p-12 border-4 border-border border-dashed text-center opacity-40 italic font-base bg-white">
                        No active orders to fulfill.
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {orders.map((order) => (
                            <Card key={order.id} className="border-4 border-border shadow-shadow bg-white flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform">
                                <div className="p-4 border-b-4 border-border bg-main flex justify-between items-center">
                                    <div>
                                        <p className="font-heading text-lg leading-none uppercase text-main-foreground">Order #{order.id}</p>
                                        <p className="font-base text-[10px] text-main-foreground/80 mt-1 uppercase italic font-bold bg-black/10 px-1 inline-block border border-black/20">Room {order.session.room.room_number} • {order.user.name}</p>
                                    </div>
                                    <Badge className={cn(
                                        "border-2 border-border font-heading text-[10px] shadow-shadow",
                                        order.status === 'Processing' ? "bg-yellow-400 text-black" : "bg-secondary text-secondary-foreground"
                                    )}>
                                        {order.status}
                                    </Badge>
                                </div>
                                
                                <div className="p-4 flex-1 space-y-3 bg-secondary/5">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center border-b-2 border-border border-dotted pb-2 last:border-0 last:pb-0">
                                            <span className="font-heading text-sm uppercase">{item.product.name}</span>
                                            <span className="bg-black text-white px-2 py-0.5 rounded-base font-heading text-xs shadow-shadow">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 border-t-4 border-border flex gap-2 bg-white">
                                    {order.status === 'Processing' && (
                                        <Button 
                                            onClick={() => updateStatus(order.id, 'Out for Delivery')}
                                            disabled={processing}
                                            className="flex-1 h-10 text-xs bg-secondary text-secondary-foreground border-2 border-border shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all uppercase tracking-widest"
                                        >
                                            Ship
                                        </Button>
                                    )}
                                    <Button 
                                        onClick={() => updateStatus(order.id, 'Done')}
                                        disabled={processing}
                                        className="flex-1 h-10 text-xs bg-[#ff90e8] text-black border-2 border-border shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all uppercase tracking-widest"
                                    >
                                        Deliver
                                    </Button>
                                    <Button 
                                        onClick={() => updateStatus(order.id, 'Cancelled')}
                                        disabled={processing}
                                        variant="secondary"
                                        className="h-10 text-xs bg-red-400 text-black border-2 border-border shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all uppercase tracking-widest"
                                    >
                                        X
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
