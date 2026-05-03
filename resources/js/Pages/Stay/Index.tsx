import { Head, Link, usePage } from "@inertiajs/react";
import React from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { cn } from "@/lib/utils";
import { route } from "ziggy-js";

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

interface StayHistoryProps {
    history: {
        data: HistoricalStay[];
        links: any[];
        meta: any;
        current_page: number;
        last_page: number;
    };
    filters: {
        from?: string;
        to?: string;
    };
}

export default function StayHistory() {
    const { history, filters } = usePage<StayHistoryProps>().props;

    return (
        <>
            <Head title="Stay History" />
            
            <div className="min-h-screen bg-secondary-background">
                <header className="border-b-2 border-border bg-main p-4 flex justify-between items-center shadow-shadow">
                    <Link href="/" className="font-heading text-2xl tracking-tighter text-main-foreground italic uppercase">
                        PAVA COFFEE
                    </Link>
                    <div className="flex gap-4">
                        <Link href={route('orders.index')} className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase">
                            My Orders
                        </Link>
                        <Link href="/" className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase">
                            Book a Room
                        </Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto p-6 space-y-12">
                    <section className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h1 className="text-4xl font-heading uppercase italic border-b-4 border-main inline-block">
                                Stay History
                            </h1>
                            <div className="flex gap-2">
                                <input 
                                    type="date" 
                                    className="border-2 border-border rounded-base px-3 py-1.5 text-sm font-base shadow-shadow bg-white"
                                    defaultValue={filters.from}
                                />
                                <span className="font-heading self-center">-</span>
                                <input 
                                    type="date" 
                                    className="border-2 border-border rounded-base px-3 py-1.5 text-sm font-base shadow-shadow bg-white"
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

                        {/* Pagination */}
                        {history.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {history.links.map((link, i) => (
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
