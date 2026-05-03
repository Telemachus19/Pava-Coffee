import { Head, Link, usePage } from "@inertiajs/react";
import React from "react";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { Text } from "@/components/retroui/Text";
import { cn } from "@/lib/utils";
import { route } from "ziggy-js";

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: string;
    product: {
        name: string;
    };
}

interface Order {
    id: number;
    status: string;
    ordered_at: string;
    session: {
        room: {
            room_number: string;
            store: {
                name: string;
            };
        };
    };
    items: OrderItem[];
}

interface OrdersIndexProps {
    orders: {
        data: Order[];
        links: any[];
        meta: any;
        current_page: number;
        last_page: number;
    };
    auth: {
        user: any;
    };
}

export default function OrderIndex() {
    const { orders, auth } = usePage<OrdersIndexProps>().props;

    const calculateTotal = (order: Order) => {
        return order.items.reduce((sum, item) => {
            return sum + (parseFloat(item.unit_price) * item.quantity);
        }, 0).toFixed(2);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Processing': return 'bg-yellow-400';
            case 'Out for Delivery': return 'bg-blue-400';
            case 'Completed': return 'bg-green-400';
            case 'Cancelled': return 'bg-red-400';
            default: return 'bg-gray-400';
        }
    };

    return (
        <>
            <Head title="My Orders" />
            
            <div className="min-h-screen bg-secondary-background">
                <header className="border-b-2 border-border bg-main p-4 flex justify-between items-center shadow-shadow">
                    <Link href="/" className="font-heading text-2xl tracking-tighter text-main-foreground italic uppercase">
                        PAVA COFFEE
                    </Link>
                    <div className="flex gap-4">
                        <Link href={route('stays.index')} className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase">
                            Stay History
                        </Link>
                        <Link href="/" className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase">
                            Book a Room
                        </Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto p-6 space-y-12">
                    <section className="space-y-6">
                        <h1 className="text-4xl font-heading uppercase italic border-b-4 border-main inline-block">
                            Order History
                        </h1>

                        {orders.data.length === 0 ? (
                            <Card className="p-12 border-2 border-border border-dashed text-center opacity-40 italic font-base">
                                You haven't placed any orders yet.
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {orders.data.map(order => (
                                    <Card key={order.id} className="w-full border-2 border-border shadow-shadow bg-white overflow-hidden">
                                        <div className="border-b-2 border-border bg-secondary/5 p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-main/10 border-2 border-main p-2 rounded-base font-heading text-main text-sm">
                                                    #{order.id}
                                                </div>
                                                <div>
                                                    <p className="font-heading text-sm uppercase">
                                                        {order.session.room.store.name} • Room {order.session.room.room_number}
                                                    </p>
                                                    <p className="font-base text-xs text-foreground/60">
                                                        {new Date(order.ordered_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={cn("border-2 border-border font-heading text-xs uppercase", getStatusColor(order.status))}>
                                                {order.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="p-4 space-y-4">
                                            <div className="space-y-2">
                                                {order.items.map(item => (
                                                    <div key={item.id} className="flex justify-between items-center font-base text-sm">
                                                        <span>{item.quantity}x {item.product.name}</span>
                                                        <span className="text-foreground/60">${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="pt-4 border-t-2 border-border border-dashed flex justify-between items-center">
                                                <Text className="font-heading uppercase text-sm">Total Amount</Text>
                                                <Text className="font-heading text-lg">${calculateTotal(order)}</Text>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {orders.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={cn(
                                            "px-4 py-2 border-2 border-border rounded-base font-heading text-sm transition-all shadow-shadow hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]",
                                            link.active ? "bg-main text-main-foreground" : "bg-white",
                                            !link.url && "opacity-50 cursor-not-allowed"
                                        )}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}
