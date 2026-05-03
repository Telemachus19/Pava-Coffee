import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { cn } from "@/lib/utils";
import { route } from "ziggy-js";

interface Invoice {
    time_details: {
        join_time: string;
        leave_time: string;
        total_minutes: number;
        free_minutes: number;
        billable_minutes: number;
        hourly_rate: string;
        cost: number;
    };
    order_items: Array<{
        name: string;
        quantity: number;
        unit_price: string;
        total: number;
    }>;
    product_total: number;
    grand_total: number;
}

interface Session {
    id: number;
    room: {
        room_number: string;
        store: { name: string };
        room_type: { name: string };
    };
}

interface CheckoutProps {
    session: Session;
    invoice: Invoice;
    is_host: boolean;
}

export default function Checkout() {
    const { session, invoice, is_host } = usePage<CheckoutProps>().props;
    const { post, processing } = useForm({});

    const handlePayment = () => {
        post(route('session.pay', { session: session.id }));
    };

    const handleEndForAll = () => {
        if (confirm("This will force checkout for everyone and free the room. Continue?")) {
            post(route('session.end-all', { session: session.id }));
        }
    };

    return (
        <>
            <Head title="Final Receipt" />
            
            <div className="min-h-screen bg-secondary-background p-6">
                <header className="max-w-3xl mx-auto mb-8 flex justify-between items-center">
                    <Link href="/" className="font-heading text-2xl tracking-tighter text-main italic uppercase">
                        PAVA COFFEE
                    </Link>
                    <Badge variant="outline" className="bg-white border-2 border-border font-heading text-xs">
                        RECEIPT #S-{session.id}
                    </Badge>
                </header>

                <main className="max-w-3xl mx-auto">
                    <Card className="border-4 border-border shadow-shadow overflow-hidden bg-white">
                        {/* Receipt Header */}
                        <div className="p-8 border-b-4 border-border border-dashed text-center space-y-2">
                            <h1 className="text-4xl font-heading uppercase italic">Final Receipt</h1>
                            <p className="font-base text-foreground/60">{session.room.store.name} • Room #{session.room.room_number}</p>
                            <p className="font-base text-xs text-foreground/40">{new Date().toLocaleString()}</p>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Time Charges */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-heading uppercase italic border-b-2 border-border inline-block">Space Usage</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between font-base text-sm">
                                        <span>Total Time ({invoice.time_details.total_minutes} mins)</span>
                                        <span>${(invoice.time_details.total_minutes / 60 * parseFloat(invoice.time_details.hourly_rate)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-base text-sm text-green-600">
                                        <span>First {invoice.time_details.free_minutes} Minutes (Free)</span>
                                        <span>-${(invoice.time_details.free_minutes / 60 * parseFloat(invoice.time_details.hourly_rate)).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-heading text-lg pt-2 border-t-2 border-border border-dotted">
                                        <span>Time Subtotal</span>
                                        <span>${invoice.time_details.cost.toFixed(2)}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Food & Drink */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-heading uppercase italic border-b-2 border-border inline-block">Orders</h2>
                                {invoice.order_items.length > 0 ? (
                                    <div className="space-y-3">
                                        {invoice.order_items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between font-base text-sm">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span>${item.total.toFixed(2)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between font-heading text-lg pt-2 border-t-2 border-border border-dotted">
                                            <span>Orders Subtotal</span>
                                            <span>${invoice.product_total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="font-base text-sm text-foreground/40 italic">No food or drink orders placed.</p>
                                )}
                            </section>

                            {/* Grand Total */}
                            <section className="bg-main/10 p-6 border-4 border-main rounded-base space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-heading uppercase italic">Total Due</span>
                                    <span className="text-5xl font-heading text-main">${invoice.grand_total.toFixed(2)}</span>
                                </div>
                                <Button 
                                    className="w-full h-16 text-2xl uppercase tracking-widest shadow-shadow"
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? "Processing..." : "Confirm & Pay"}
                                </Button>
                            </section>
                        </div>

                        {/* Host Controls */}
                        {is_host && (
                            <div className="p-8 bg-gray-50 border-t-4 border-border space-y-4">
                                <p className="text-xs font-base text-center text-foreground/50 uppercase">Host Administrative Actions</p>
                                <Button 
                                    variant="secondary" 
                                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                                    onClick={handleEndForAll}
                                    disabled={processing}
                                >
                                    End Session for All Guests
                                </Button>
                            </div>
                        )}

                        <div className="p-4 text-center font-heading text-[10px] uppercase opacity-30">
                            Pava Coffee • All rights reserved
                        </div>
                    </Card>
                </main>
            </div>
        </>
    );
}
