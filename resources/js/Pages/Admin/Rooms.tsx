import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { Head, useForm, Link } from "@inertiajs/react";
import React, { useState } from "react";
import { route } from "ziggy-js";

interface RoomType {
    id: number;
    name: string;
}

interface Room {
    id: number;
    room_number: string;
    max_capacity: number;
    current_status: 'available' | 'occupied' | 'maintenance';
    room_type: RoomType;
    room_type_id: number;
}

interface Store {
    id: number;
    name: string;
}

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface RoomsProps {
    store: Store;
    rooms: PaginatedData<Room>;
    roomTypes: RoomType[];
}

export default function Rooms({ store, rooms, roomTypes }: RoomsProps) {
    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        room_number: "",
        room_type_id: "",
        max_capacity: "",
        current_status: "available",
    });

    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingRoom) {
            patch(route("admin.stores.rooms.update", { store: store.id, room: editingRoom.id }), {
                onSuccess: () => cancelEdit(),
            });
        } else {
            post(route("admin.stores.rooms.store", { store: store.id }), {
                onSuccess: () => reset(),
            });
        }
    };

    const startEdit = (room: Room) => {
        setEditingRoom(room);
        setData({
            room_number: room.room_number,
            room_type_id: room.room_type_id.toString(),
            max_capacity: room.max_capacity.toString(),
            current_status: room.current_status,
        });
    };

    const cancelEdit = () => {
        setEditingRoom(null);
        reset();
    };

    const deleteRoom = (room: Room) => {
        if (confirm(`Are you sure you want to remove Room #${room.room_number}?`)) {
            destroy(route("admin.stores.rooms.destroy", { store: store.id, room: room.id }));
        }
    };

    return (
        <AdminLayout title={`Rooms: ${store.name}`}>
            <Head title={`Admin - ${store.name} Rooms`} />

            <div className="mb-6">
                <Link href={route('admin.stores.index')} className="text-main font-heading uppercase underline">
                    &larr; Back to Locations
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <Card className="p-6 border-4 border-border shadow-shadow bg-white sticky top-10 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <h2 className="text-2xl font-heading uppercase italic border-b-2 border-border pb-2 mb-6">
                            {editingRoom ? "Edit Room" : "Add New Room"}
                        </h2>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="room_number" className="font-heading">Room Number</Label>
                                <Input
                                    id="room_number"
                                    value={data.room_number}
                                    onChange={(e) => setData("room_number", e.target.value)}
                                    placeholder="e.g., 101 or Meeting Room A"
                                    required
                                />
                                {errors.room_number && <p className="text-red-500 text-xs font-heading">{errors.room_number}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="room_type" className="font-heading">Room Type</Label>
                                <select
                                    id="room_type"
                                    className="w-full h-10 px-4 border-2 border-border rounded-base font-base focus:outline-none focus:border-main shadow-shadow appearance-none bg-white"
                                    value={data.room_type_id}
                                    onChange={(e) => setData("room_type_id", e.target.value)}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    {roomTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                                {errors.room_type_id && <p className="text-red-500 text-xs font-heading">{errors.room_type_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_capacity" className="font-heading">Max Capacity</Label>
                                <Input
                                    id="max_capacity"
                                    type="number"
                                    min="1"
                                    value={data.max_capacity}
                                    onChange={(e) => setData("max_capacity", e.target.value)}
                                    required
                                />
                                {errors.max_capacity && <p className="text-red-500 text-xs font-heading">{errors.max_capacity}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="current_status" className="font-heading">Status</Label>
                                <select
                                    id="current_status"
                                    className="w-full h-10 px-4 border-2 border-border rounded-base font-base focus:outline-none focus:border-main shadow-shadow appearance-none bg-white"
                                    value={data.current_status}
                                    onChange={(e) => setData("current_status", e.target.value as any)}
                                    required
                                >
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                                {errors.current_status && <p className="text-red-500 text-xs font-heading">{errors.current_status}</p>}
                            </div>

                            <div className="flex gap-2">
                                <Button disabled={processing} className="flex-1 h-12 text-lg">
                                    {processing ? "Saving..." : (editingRoom ? "Update" : "Create")}
                                </Button>
                                {editingRoom && (
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        disabled={processing} 
                                        onClick={cancelEdit}
                                        className="h-12"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Card>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <Card className="border-4 border-border shadow-shadow bg-white overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead className="bg-black text-white font-heading uppercase text-sm border-b-4 border-border">
                                    <tr>
                                        <th className="p-4 border-r-2 border-border">Room</th>
                                        <th className="p-4 border-r-2 border-border">Type</th>
                                        <th className="p-4 border-r-2 border-border text-center">Capacity</th>
                                        <th className="p-4 border-r-2 border-border text-center">Status</th>
                                        <th className="p-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="font-base text-sm divide-y-2 divide-border">
                                    {rooms.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-foreground/40 italic">
                                                No rooms exist for this location.
                                            </td>
                                        </tr>
                                    ) : (
                                        rooms.data.map((room) => (
                                            <tr key={room.id} className="hover:bg-main/5 transition-colors">
                                                <td className="p-4 border-r-2 border-border font-heading text-lg">#{room.room_number}</td>
                                                <td className="p-4 border-r-2 border-border opacity-70 italic">{room.room_type?.name}</td>
                                                <td className="p-4 border-r-2 border-border text-center">{room.max_capacity}</td>
                                                <td className="p-4 border-r-2 border-border text-center">
                                                    <span className={`px-2 py-1 rounded-base border-2 font-heading text-[10px] uppercase shadow-shadow ${
                                                        room.current_status === 'available' ? "bg-green-400 border-border text-black" : 
                                                        room.current_status === 'occupied' ? "bg-red-400 border-border text-black" : "bg-yellow-400 border-border text-black"
                                                    }`}>
                                                        {room.current_status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center space-x-2">
                                                    <button 
                                                        onClick={() => startEdit(room)}
                                                        className="px-3 py-1.5 rounded-base border-2 font-heading text-[10px] uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-white"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteRoom(room)}
                                                        className="px-3 py-1.5 rounded-base border-2 font-heading text-[10px] uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer bg-red-400"
                                                    >
                                                        X
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {rooms.links && rooms.links.length > 3 && (
                            <div className="p-4 border-t-4 border-border bg-secondary/10 flex justify-center gap-2 flex-wrap">
                                {rooms.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || "#"}
                                        preserveScroll
                                        className={`px-4 py-2 border-2 border-border font-heading text-sm shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all ${
                                            link.active ? "bg-main text-main-foreground" : "bg-white text-black"
                                        } ${!link.url ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        onClick={(e) => !link.url && e.preventDefault()}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
