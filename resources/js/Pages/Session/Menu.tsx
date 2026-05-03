import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React, { useState } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Badge } from "@/components/retroui/Badge";
import { cn } from "@/lib/utils";
import { route } from "ziggy-js";

interface Product {
    id: number;
    name: string;
    price: string;
    image: string | null;
}

interface Category {
    id: number;
    name: string;
    products: Product[];
}

interface Session {
    id: number;
    room: {
        room_number: string;
        store: {
            name: string;
        };
    };
}

interface MenuProps {
    session: Session;
    categories: Category[];
}

interface CartItem extends Product {
    quantity: number;
}

export default function Menu() {
    const { session, categories } = usePage<MenuProps>().props;
    const [cart, setCart] = useState<CartItem[]>([]);

    const { post, processing, data, setData, transform } = useForm({
        items: [] as { product_id: number; quantity: number }[]
    });

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    const handleSubmitOrder = () => {
        if (cart.length === 0) return;

        transform((data) => ({
            ...data,
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))
        }));

        post(route('order.store', { session: session.id }), {
            onSuccess: () => {
                setCart([]);
            }
        });
    };

    return (
        <>
            <Head title={`Menu - Room #${session.room.room_number}`} />
            
            <div className="min-h-screen bg-secondary-background pb-32">
                <header className="border-b-2 border-border bg-main p-4 flex justify-between items-center shadow-shadow sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <Link href={route('session.show', { session: session.id })} className="font-heading text-xl text-main-foreground hover:underline">
                            ← Back
                        </Link>
                        <span className="font-heading text-2xl tracking-tighter text-main-foreground italic uppercase">
                            Menu
                        </span>
                    </div>
                    <div className="bg-white border-2 border-border px-4 py-1 rounded-base shadow-shadow font-heading text-sm uppercase">
                        Room #{session.room.room_number} • {session.room.store.name}
                    </div>
                </header>

                <main className="max-w-6xl mx-auto p-6 grid lg:grid-cols-3 gap-8">
                    {/* Menu Items */}
                    <div className="lg:col-span-2 space-y-12">
                        {categories.map((category) => (
                            <section key={category.id} className="space-y-6">
                                <h2 className="text-3xl font-heading uppercase italic border-b-4 border-main inline-block">
                                    {category.name}
                                </h2>
                                
                                <div className="grid md:grid-cols-2 gap-6">
                                    {category.products.map((product) => (
                                        <Card key={product.id} className="p-4 border-2 border-border shadow-shadow flex gap-4 bg-white hover:bg-main/5 transition-colors">
                                            <div className="w-24 h-24 bg-gray-100 border-2 border-border rounded-base flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-2xl font-heading text-foreground/20 italic uppercase tracking-tighter">no img</span>
                                                )}
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h3 className="font-heading text-lg leading-tight uppercase">{product.name}</h3>
                                                    <p className="font-heading text-main text-xl">${product.price}</p>
                                                </div>
                                                <Button 
                                                    onClick={() => addToCart(product)}
                                                    className="h-8 text-xs uppercase self-start"
                                                >
                                                    Add to Tab
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>

                    {/* Personal Tab / Cart */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-4 border-border shadow-shadow overflow-hidden bg-white">
                                <div className="bg-secondary p-4 border-b-2 border-border">
                                    <h2 className="text-xl font-heading uppercase italic text-secondary-foreground text-center">My Personal Tab</h2>
                                </div>
                                
                                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-12 space-y-2 opacity-40 italic font-base">
                                            <p className="font-heading uppercase text-xs">Tab Empty</p>
                                            <p className="text-sm">Your tab is empty.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {cart.map((item) => (
                                                <div key={item.id} className="flex justify-between items-center gap-4 border-b-2 border-border border-dotted pb-4 last:border-0 last:pb-0">
                                                    <div className="flex-1">
                                                        <p className="font-heading text-sm uppercase leading-none">{item.name}</p>
                                                        <p className="font-base text-xs text-foreground/60">${item.price} each</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-6 h-6 border-2 border-border rounded-base flex items-center justify-center font-heading hover:bg-main/10"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="font-heading w-6 text-center">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-6 h-6 border-2 border-border rounded-base flex items-center justify-center font-heading hover:bg-main/10"
                                                        >
                                                            +
                                                        </button>
                                                        <button 
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="ml-2 text-red-500 hover:text-red-700"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t-4 border-border bg-main/5 space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="font-heading uppercase text-sm">Personal Total</span>
                                        <span className="text-3xl font-heading text-main">${total.toFixed(2)}</span>
                                    </div>
                                    
                                    <Button 
                                        disabled={cart.length === 0 || processing}
                                        onClick={handleSubmitOrder}
                                        className="w-full h-14 text-xl uppercase tracking-wider"
                                    >
                                        {processing ? "Sending to Kitchen..." : "Place Order"}
                                    </Button>
                                    <p className="text-[10px] text-center font-base text-foreground/50 uppercase">
                                        Note: This order will be billed to your individual tab.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
