import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { Head, useForm, Link } from "@inertiajs/react";
import React, { useState } from "react";
import { route } from "ziggy-js";
import { cn } from "@/lib/utils";

interface Store {
    id: number;
    name: string;
    address: string;
    is_active: boolean;
}

interface StoresProps {
    stores: Store[];
}

export default function Stores({ stores }: StoresProps) {
    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        name: "",
        address: "",
        is_active: true,
    });

    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingStore) {
            patch(route("admin.stores.update", { store: editingStore.id }), {
                onSuccess: () => cancelEdit(),
            });
        } else {
            post(route("admin.stores.store"), {
                onSuccess: () => reset(),
            });
        }
    };

    const startEdit = (store: Store) => {
        setEditingStore(store);
        setData({
            name: store.name,
            address: store.address || "",
            is_active: store.is_active,
        });
    };

    const cancelEdit = () => {
        setEditingStore(null);
        reset();
    };

    const deleteStore = (store: Store) => {
        if (confirm(`Are you sure you want to remove ${store.name}?`)) {
            destroy(route("admin.stores.destroy", { store: store.id }));
        }
    };

    return (
        <AdminLayout title="Manage Locations">
            <Head title="Admin - Locations" />

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <Card className="p-6 border-4 border-border shadow-shadow bg-white sticky top-10 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <h2 className="text-2xl font-heading uppercase italic border-b-2 border-border pb-2 mb-6">
                            {editingStore ? "Edit Location" : "Add New Location"}
                        </h2>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-heading">Store Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="e.g., Pava Coffee - North End"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs font-heading">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="font-heading">Address</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData("address", e.target.value)}
                                    placeholder="123 Street Name"
                                    required
                                />
                                {errors.address && <p className="text-red-500 text-xs font-heading">{errors.address}</p>}
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData("is_active", e.target.checked)}
                                    className="w-6 h-6 rounded-base border-2 border-border text-main focus:ring-0 cursor-pointer accent-black"
                                />
                                <Label htmlFor="is_active" className="font-heading cursor-pointer select-none">
                                    Active Location
                                </Label>
                            </div>

                            <div className="flex gap-2">
                                <Button disabled={processing} className="flex-1 h-12 text-lg">
                                    {processing ? "Saving..." : (editingStore ? "Update" : "Create")}
                                </Button>
                                {editingStore && (
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
                    <div className="grid md:grid-cols-2 gap-6">
                        {stores.map((store) => (
                            <Card key={store.id} className="p-6 border-4 border-border shadow-shadow bg-secondary/10 space-y-4 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden">
                                {/* Status Ribbon */}
                                <div className="absolute top-0 right-0">
                                    <div className={cn(
                                        "px-4 py-1 border-l-4 border-b-4 border-border font-heading text-[10px] uppercase shadow-none rounded-bl-base",
                                        store.is_active ? "bg-green-400 text-black" : "bg-red-400 text-black"
                                    )}>
                                        {store.is_active ? "Active" : "Inactive"}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <h3 className="text-2xl font-heading uppercase leading-tight bg-white px-2 py-1 border-2 border-border shadow-shadow inline-block max-w-full break-words">
                                        {store.name}
                                    </h3>
                                </div>
                                <p className="font-base text-sm opacity-90 italic bg-white p-2 border-2 border-border">{store.address}</p>
                                <div className="pt-4 flex gap-2">
                                    <button 
                                        onClick={() => startEdit(store)}
                                        className="flex-1 py-2 rounded-base border-2 border-border bg-white font-heading text-xs uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <Link href={route('admin.stores.rooms.index', { store: store.id })} className="flex-1">
                                        <button className="w-full py-2 rounded-base border-2 border-border bg-black text-white font-heading text-xs uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer">
                                            Rooms
                                        </button>
                                    </Link>
                                    <button 
                                        onClick={() => deleteStore(store)}
                                        className="px-4 py-2 rounded-base border-2 border-border bg-red-400 text-black font-heading text-xs uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                                    >
                                        X
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
