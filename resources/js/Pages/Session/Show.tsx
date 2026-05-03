import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { cn } from "@/lib/utils";
import { route } from "ziggy-js";

interface User {
    id: number;
    name: string;
    email: string;
}

interface RoomType {
    id: number;
    name: string;
    free_base_minutes: number;
    hourly_rate: string;
}

interface Room {
    id: number;
    room_number: string;
    max_capacity: number;
    room_type: RoomType;
}

interface SessionGuest {
    id: number;
    user: User;
    join_time: string;
    leave_time: string | null;
}

interface Invitation {
    id: number;
    user: User;
    status: 'pending' | 'accepted' | 'declined';
}

interface OrderItem {
    id: number;
    quantity: number;
    product: { name: string };
}

interface Order {
    id: number;
    status: string;
    items: OrderItem[];
}

interface Session {
    id: number;
    room_id: number;
    host_id: number;
    start_time: string;
    base_end_time: string;
    status: 'active' | 'completed';
    privacy: 'private' | 'shared';
    room: Room;
    host: User;
    guests: SessionGuest[];
    invitations: Invitation[];
    orders: Order[];
}

interface ShowProps {
    session: Session;
    auth: {
        user: User;
    };
    status?: string;
}

interface SearchResult {
    id: number;
    name: string;
    email: string;
    is_busy: boolean;
    is_invited: boolean;
}

const Timer = ({ targetDate }: { targetDate: string }) => {
    const { server_time } = usePage<{ server_time: string }>().props;
    const [timeLeft, setTimeLeft] = useState<{ mins: number; secs: number } | null>(null);

    useEffect(() => {
        // Force Z suffix for UTC parsing if missing
        const parseDate = (d: string) => {
            if (!d) return 0;
            const normalized = d.endsWith('Z') || d.includes('+') ? d : `${d.replace(' ', 'T')}Z`;
            return new Date(normalized).getTime();
        };

        const serverStart = parseDate(server_time);
        const clientStart = new Date().getTime();
        const drift = serverStart - clientStart;

        console.log('Timer Sync:', {
            serverRaw: server_time,
            targetRaw: targetDate,
            drift: drift
        });

        const calculate = () => {
            const target = parseDate(targetDate);
            const nowAdjusted = new Date().getTime() + drift;
            const difference = target - nowAdjusted;
            
            if (difference > 0) {
                setTimeLeft({
                    mins: Math.floor((difference / 1000 / 60)),
                    secs: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, [targetDate, server_time]);

    if (!timeLeft) return <span className="text-red-500 font-heading animate-pulse">TIME UP</span>;

    return (
        <span className={cn(
            "font-heading",
            timeLeft.mins < 5 ? "text-red-500 animate-pulse" : "text-main"
        )}>
            {timeLeft.mins.toString().padStart(2, '0')}:{timeLeft.secs.toString().padStart(2, '0')}
        </span>
    );
};

export default function Show() {
    const { session, auth, status } = usePage<ShowProps>().props;
    const isHost = auth.user.id === session.host_id;

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const privacyForm = useForm({
        privacy: session.privacy
    });
    
    // We need to destructure transform from useForm
    const { transform: privacyTransform, patch: privacyPatch, data: privacyData, setData: privacySetData } = privacyForm;

    const inviteForm = useForm({
        user_ids: [] as number[]
    });

    useEffect(() => {
        if (searchQuery.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                setIsSearching(true);
                fetch(route('invitations.search', { session: session.id, query: searchQuery }))
                    .then(res => res.json())
                    .then(data => {
                        setSearchResults(data);
                        setIsSearching(false);
                    });
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const handlePrivacyChange = (newPrivacy: 'private' | 'shared') => {
        if (newPrivacy === privacyData.privacy) return;

        privacySetData('privacy', newPrivacy);
        
        privacyTransform((data) => ({
            ...data,
            privacy: newPrivacy
        }));

        privacyPatch(route('session.privacy', { session: session.id }));
    };

    const toggleUserSelection = (userId: number) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) 
                : [...prev, userId]
        );
    };

    const handleSendInvites = () => {
        inviteForm.setData('user_ids', selectedUsers);
        inviteForm.post(route('invitations.invite', { session: session.id }), {
            onSuccess: () => {
                setSelectedUsers([]);
                setSearchQuery("");
            }
        });
    };

    const activeGuests = session.guests.filter(g => !g.leave_time);
    const pendingInvites = session.invitations.filter(i => i.status === 'pending');
    const occupiedSlots = activeGuests.length + pendingInvites.length;

    return (
        <>
            <Head title={`Room #${session.room.room_number} - Active Session`} />
            
            <div className="min-h-screen bg-secondary-background">
                <header className="border-b-2 border-border bg-main p-4 flex justify-between items-center shadow-shadow">
                    <Link href="/" className="font-heading text-2xl tracking-tighter text-main-foreground italic uppercase">
                        PAVA COFFEE
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="bg-white border-2 border-border px-4 py-1 rounded-base shadow-shadow flex items-center gap-2">
                            <span className="font-heading text-xs uppercase opacity-50">Free Time Left:</span>
                            <div className="text-xl">
                                <Timer targetDate={session.base_end_time} />
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-white border-2 border-border font-heading uppercase py-1 px-3">
                            Session ID: S-{session.id}
                        </Badge>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto p-6 grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Session Info & Privacy */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="p-6 border-4 border-border shadow-shadow space-y-4">
                            <h2 className="text-2xl font-heading uppercase italic">Room Information</h2>
                            <div className="space-y-2 border-l-4 border-main pl-4">
                                <p className="text-3xl font-heading">#{session.room.room_number}</p>
                                <p className="font-heading text-sm uppercase text-foreground/60">{session.room.room_type.name}</p>
                            </div>
                            <div className="space-y-1 font-base text-sm">
                                <p><span className="font-heading">Host:</span> {session.host.name}</p>
                                <p><span className="font-heading">Start Time:</span> {new Date(session.start_time).toLocaleTimeString()}</p>
                                <p><span className="font-heading">Free Period Ends:</span> {new Date(session.base_end_time).toLocaleTimeString()}</p>
                            </div>
                        </Card>

                        {isHost && (
                            <Card className="p-6 border-4 border-border shadow-shadow space-y-4 bg-white">
                                <h2 className="text-xl font-heading uppercase italic">Privacy Settings</h2>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handlePrivacyChange('shared')}
                                        className={cn(
                                            "flex-1 py-2 rounded-base border-2 font-heading uppercase text-sm transition-all shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
                                            privacyData.privacy === 'shared' 
                                                ? "bg-main text-main-foreground border-border" 
                                                : "bg-white border-border text-foreground/40"
                                        )}
                                    >
                                        Shared
                                    </button>
                                    <button
                                        onClick={() => handlePrivacyChange('private')}
                                        className={cn(
                                            "flex-1 py-2 rounded-base border-2 font-heading uppercase text-sm transition-all shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none",
                                            privacyData.privacy === 'private' 
                                                ? "bg-main text-main-foreground border-border" 
                                                : "bg-white border-border text-foreground/40"
                                        )}
                                    >
                                        Private
                                    </button>
                                </div>
                                <p className="text-xs font-base text-foreground/60">
                                    Shared sessions allow invited guests to join. Private sessions are restricted to you only.
                                </p>
                            </Card>
                        )}
                    </div>

                    {/* Middle & Right Column: Guest Management & Orders */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex gap-4">
                            <Link href={route('session.menu', { session: session.id })} className="flex-1">
                                <Button className="w-full h-16 text-xl uppercase tracking-widest bg-main text-main-foreground shadow-shadow border-4 border-border">
                                    Browse Menu & Order
                                </Button>
                            </Link>
                            <Link href={route('session.checkout', { session: session.id })} className="flex-1">
                                <Button variant="secondary" className="w-full h-16 text-xl uppercase tracking-widest shadow-shadow border-4 border-border">
                                    Check Out & Pay
                                </Button>
                            </Link>
                        </div>

                        {/* Guest Management */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="p-6 border-4 border-border shadow-shadow space-y-4 bg-white h-fit">
                                <div className="flex justify-between items-center border-b-2 border-border pb-2">
                                    <h2 className="text-xl font-heading uppercase italic">Live Occupancy</h2>
                                    <Badge className="bg-secondary text-secondary-foreground border-2 border-border font-heading">
                                        {occupiedSlots} / {session.room.max_capacity}
                                    </Badge>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="font-heading text-xs uppercase text-foreground/60">Host</p>
                                        <div className="flex items-center gap-3 bg-main/5 p-2 border-2 border-border rounded-base">
                                            <div className="w-8 h-8 rounded-full bg-main border-2 border-border flex items-center justify-center font-heading text-main-foreground">
                                                {session.host.name[0]}
                                            </div>
                                            <span className="font-heading">{session.host.name} {isHost && "(You)"}</span>
                                        </div>
                                    </div>

                                    {activeGuests.filter(g => g.user.id !== session.host_id).length > 0 && (
                                        <div className="space-y-2">
                                            <p className="font-heading text-xs uppercase text-foreground/60">Active Guests</p>
                                            {activeGuests.filter(g => g.user.id !== session.host_id).map((guest) => (
                                                <div key={guest.id} className="flex items-center gap-3 p-2 border-2 border-border rounded-base">
                                                    <div className="w-8 h-8 rounded-full bg-secondary border-2 border-border flex items-center justify-center font-heading text-secondary-foreground">
                                                        {guest.user.name[0]}
                                                    </div>
                                                    <span className="font-heading">{guest.user.name} {guest.user.id === auth.user.id && "(You)"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {pendingInvites.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="font-heading text-xs uppercase text-foreground/60">Pending Invites</p>
                                            {pendingInvites.map((invite) => (
                                                <div key={invite.id} className="flex items-center gap-3 p-2 border-2 border-border border-dashed rounded-base opacity-60">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-border flex items-center justify-center font-heading text-gray-500">
                                                        {invite.user.name[0]}
                                                    </div>
                                                    <span className="font-heading italic">{invite.user.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {isHost && session.privacy === 'shared' && (
                                <Card className="p-6 border-4 border-border shadow-shadow space-y-4 bg-white">
                                    <h2 className="text-xl font-heading uppercase italic">Invite Guests</h2>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search by name or email..."
                                                className="w-full h-10 px-4 border-2 border-border rounded-base font-base focus:outline-none focus:border-main shadow-shadow"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {isSearching && (
                                                <div className="absolute right-3 top-3">
                                                    <div className="animate-spin h-4 w-4 border-2 border-main border-t-transparent rounded-full"></div>
                                                </div>
                                            )}
                                        </div>

                                        {searchResults.length > 0 && (
                                            <div className="border-2 border-border rounded-base max-h-48 overflow-y-auto divide-y-2 divide-border shadow-shadow">
                                                {searchResults.map((user) => (
                                                    <div 
                                                        key={user.id} 
                                                        className={cn(
                                                            "p-2 flex justify-between items-center transition-colors",
                                                            user.is_busy || user.is_invited ? "bg-gray-50 opacity-50 cursor-not-allowed" : "hover:bg-main/5 cursor-pointer"
                                                        )}
                                                        onClick={() => !user.is_busy && !user.is_invited && toggleUserSelection(user.id)}
                                                    >
                                                        <div className="text-sm">
                                                            <p className="font-heading">{user.name}</p>
                                                            <p className="font-base text-xs text-foreground/60">{user.email}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {user.is_busy && <Badge variant="outline" className="text-[10px] bg-red-100">Busy</Badge>}
                                                            {user.is_invited && <Badge variant="outline" className="text-[10px] bg-yellow-100">Invited</Badge>}
                                                            {!user.is_busy && !user.is_invited && (
                                                                <div className={cn(
                                                                    "w-5 h-5 border-2 border-border rounded-base flex items-center justify-center",
                                                                    selectedUsers.includes(user.id) ? "bg-main" : "bg-white"
                                                                )}>
                                                                    {selectedUsers.includes(user.id) && <span className="text-white text-xs">✓</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {selectedUsers.length > 0 && (
                                            <Button 
                                                className="w-full h-10 text-lg" 
                                                onClick={handleSendInvites}
                                                disabled={inviteForm.processing}
                                            >
                                                Send {selectedUsers.length} Invites
                                            </Button>
                                        )}

                                        {status && <p className="text-sm font-heading text-green-600">{status}</p>}
                                        {inviteForm.errors.user_ids && <p className="text-sm font-heading text-red-600">{inviteForm.errors.user_ids}</p>}
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Orders Section */}
                        <Card className="p-6 border-4 border-border shadow-shadow bg-white space-y-6">
                            <h2 className="text-2xl font-heading uppercase italic border-b-2 border-border pb-2">Your Active Orders</h2>
                            <div className="space-y-4">
                                {session.orders && session.orders.length > 0 ? (
                                    <div className="grid gap-4">
                                        {session.orders.map((order) => (
                                            <div key={order.id} className="p-3 border-2 border-border rounded-base bg-main/5 flex justify-between items-center">
                                                <div>
                                                    <p className="font-heading text-xs uppercase opacity-50">Order #{order.id}</p>
                                                    <div className="space-y-1">
                                                        {order.items.map(item => (
                                                            <p key={item.id} className="font-base text-sm">{item.quantity}x {item.product.name}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Badge className={cn(
                                                    "border-2 border-border font-heading",
                                                    order.status === 'Processing' ? "bg-yellow-400" : "bg-green-400"
                                                )}>
                                                    {order.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="font-base text-foreground/60 italic text-center py-8">
                                        No active orders on your tab. 
                                        <Link href={route('session.menu', { session: session.id })} className="text-main underline ml-1">Order something now!</Link>
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    );
}
