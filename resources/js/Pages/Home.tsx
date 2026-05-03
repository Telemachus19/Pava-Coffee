import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Accordion } from "@/components/retroui/Accordion";
import { cn } from "@/lib/utils";
import { route } from "ziggy-js";

interface RoomType {
    id: number;
    name: string;
    hourly_rate: string;
    free_base_minutes: number;
}

interface Room {
    id: number;
    room_number: string;
    max_capacity: number;
    current_status: 'available' | 'occupied' | 'maintenance';
    room_type: RoomType;
}

interface Store {
    id: number;
    name: string;
    address: string;
    rooms: Room[];
}

interface HomeProps {
    stores: Store[];
    auth: {
        user: any;
    };
}

interface PendingInvitation {
    id: number;
    session: {
        id: number;
        host: { name: string };
        room: { room_number: string };
    };
}

export default function Home() {
    const { stores: initialStores, auth } = usePage<HomeProps>().props;
    const [stores, setStores] = useState<Store[]>(initialStores);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);

    const { post, processing } = useForm({});

    useEffect(() => {
        if (auth.user) {
            fetch(route('invitations.pending'))
                .then(res => res.json())
                .then(setPendingInvitations);
        }

        // Real-time Room Status Updates
        // @ts-ignore
        const channel = window.Echo.channel('rooms')
            .listen('.room.status.changed', (e: { roomId: number, status: string }) => {
                console.log('Room Status Change Received:', e);
                setStores(currentStores => 
                    currentStores.map(store => ({
                        ...store,
                        rooms: store.rooms.map(room => 
                            room.id === e.roomId 
                                ? { ...room, current_status: e.status as any } 
                                : room
                        )
                    }))
                );
            });

        return () => {
            // @ts-ignore
            window.Echo.leaveChannel('rooms');
        };
    }, [auth.user]);

    // Keep selectedStore in sync with real-time updates
    useEffect(() => {
        if (selectedStore) {
            const updated = stores.find(s => s.id === selectedStore.id);
            if (updated) setSelectedStore(updated);
        }
    }, [stores]);

    const handleReserve = (roomId: number) => {
        post(route("room.reserve", { room_id: roomId }));
    };

    const handleInviteRespond = (invitationId: number, status: 'accepted' | 'declined') => {
        post(route('invitations.respond', { invitation: invitationId, status }));
    };

    return (
        <>
            <Head title="Welcome to Pava Coffee" />
            
            <div className="min-h-screen bg-secondary-background">
                {/* Header */}
                <header className="border-b-2 border-border bg-main p-4 flex justify-between items-center shadow-shadow">
                    <Link href="/" className="font-heading text-2xl tracking-tighter text-main-foreground italic uppercase">
                        PAVA COFFEE
                    </Link>
                    
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <div className="flex items-center gap-4">
                                {auth.user.role?.name === 'Admin' && (
                                    <Link
                                        href={route('admin.dashboard')}
                                        className="bg-black text-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase"
                                    >
                                        Admin
                                    </Link>
                                )}
                                <span className="font-heading text-main-foreground hidden sm:inline">
                                    Hello, {auth.user.name}
                                </span>
                                <Link
                                    href={route('stays.index')}
                                    className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase"
                                >
                                    Stay History
                                </Link>
                                <Link
                                    href={route('orders.index')}
                                    className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase"
                                >
                                    My Orders
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase"
                                >
                                    Logout
                                </Link>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Link
                                    href="/login"
                                    className="bg-white border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-secondary border-2 border-border px-4 py-1 rounded-base font-heading shadow-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm uppercase"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <main className="max-w-6xl mx-auto p-6 space-y-12">
                    {/* Hero Section */}
                    <section className="py-12 text-center space-y-4">
                        <h1 className="text-5xl md:text-7xl font-heading uppercase italic tracking-tighter text-foreground drop-shadow-sm">
                            Metered-Billing <br /> Space Reservation
                        </h1>
                        <p className="text-xl font-base text-foreground/80 max-w-2xl mx-auto">
                            Grab a drink, book a room, and stay as long as you need. 
                            The first hour is on us.
                        </p>
                    </section>

                    {/* Pending Invitations */}
                    {pendingInvitations.length > 0 && (
                        <section className="space-y-6">
                            <h2 className="text-3xl font-heading uppercase italic border-b-4 border-yellow-400 inline-block">
                                Room Invitations
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingInvitations.map((invite) => (
                                    <Card key={invite.id} className="p-4 border-4 border-border shadow-shadow bg-yellow-50 space-y-4">
                                        <div className="space-y-1">
                                            <p className="font-heading text-lg uppercase italic">{invite.session.host.name} invited you!</p>
                                            <p className="font-base text-sm">Join them in Room #{invite.session.room.room_number}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                className="flex-1 bg-green-500 text-white h-10"
                                                onClick={() => handleInviteRespond(invite.id, 'accepted')}
                                            >
                                                Accept
                                            </Button>
                                            <Button 
                                                variant="secondary" 
                                                className="flex-1 h-10"
                                                onClick={() => handleInviteRespond(invite.id, 'declined')}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Store Selection */}
                    <section className="space-y-6">
                        <h2 className="text-3xl font-heading uppercase italic border-b-4 border-main inline-block">
                            Choose a Location
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {stores.map((store) => (
                                <Card 
                                    key={store.id}
                                    className={cn(
                                        "cursor-pointer p-6 border-4 transition-all hover:bg-main/5",
                                        selectedStore?.id === store.id ? "border-main shadow-none translate-x-[2px] translate-y-[2px]" : "border-border shadow-shadow"
                                    )}
                                    onClick={() => setSelectedStore(store)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-heading uppercase">{store.name}</h3>
                                            <p className="font-base text-foreground/70">{store.address}</p>
                                        </div>
                                        <div className="bg-main border-2 border-border p-2 rounded-base shadow-shadow font-heading text-main-foreground">
                                            {store.rooms.filter(r => r.current_status === 'available').length} Available
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Room Selection */}
                    {selectedStore && (
                        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-heading uppercase italic border-b-4 border-secondary inline-block">
                                Available Rooms in {selectedStore.name}
                            </h2>

                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {selectedStore.rooms.map((room) => (
                                    <Accordion.Item 
                                        key={room.id} 
                                        value={`room-${room.id}`}
                                        className="border-2 border-border rounded-base bg-white shadow-shadow overflow-hidden"
                                    >
                                        <Accordion.Header className="px-6 py-4 hover:no-underline hover:bg-main/5">
                                            <div className="flex items-center gap-6 text-left">
                                                <span className="text-3xl font-heading">#{room.room_number}</span>
                                                <div className="space-y-0.5">
                                                    <p className="font-heading uppercase text-sm text-foreground/60">{room.room_type.name}</p>
                                                    <p className="font-base">Capacity: {room.max_capacity} People</p>
                                                </div>
                                                <div className={cn(
                                                    "px-3 py-1 rounded-base border-2 border-border font-heading text-xs uppercase",
                                                    room.current_status === 'available' ? "bg-green-400" : "bg-red-400"
                                                )}>
                                                    {room.current_status}
                                                </div>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Content className="px-6 py-4 bg-secondary/5 border-t-2 border-border">
                                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                                <div className="space-y-2">
                                                    <p className="font-base">
                                                        <span className="font-heading uppercase">First {room.room_type.free_base_minutes} Minutes:</span> FREE
                                                    </p>
                                                    <p className="font-base">
                                                        <span className="font-heading uppercase">Thereafter:</span> ${room.room_type.hourly_rate} / hour
                                                    </p>
                                                </div>
                                                {!auth.user ? (
                                                    <Link href={route('login')} className="w-full md:w-auto">
                                                        <Button className="w-full px-8 h-12 text-xl">
                                                            Login to Book
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button
                                                        disabled={room.current_status !== 'available' || processing}
                                                        onClick={() => handleReserve(room.id)}
                                                        className="w-full md:w-auto px-8 h-12 text-xl"
                                                    >
                                                        {room.current_status === 'available' ? "Book Now" : "Unavailable"}
                                                    </Button>
                                                )}
                                            </div>
                                        </Accordion.Content>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </section>
                    )}
                </main>

                {/* Footer */}
                <footer className="border-t-2 border-border mt-24 p-8 text-center bg-white font-heading uppercase tracking-widest text-foreground/40">
                    &copy; 2026 Pava Coffee Systems. Est 2026.
                </footer>
            </div>
        </>
    );
}
