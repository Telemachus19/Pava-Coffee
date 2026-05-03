import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { Dialog } from "@/components/retroui/Dialog";
import { Head, useForm, Link } from "@inertiajs/react";
import React, { useState } from "react";
import { route } from "ziggy-js";

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    price: string;
    image: string | null;
    category: Category;
    is_available: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface ProductsProps {
    products: PaginatedData<Product>;
    categories: Category[];
}

export default function Products({ products, categories }: ProductsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        price: "",
        category_id: "",
        image: "",
        is_available: true,
    });

    const { patch } = useForm();

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.products.store"), {
            onSuccess: () => {
                reset();
                setIsDialogOpen(false);
            },
        });
    };

    const toggleAvailability = (productId: number) => {
        patch(route("admin.products.toggle", { product: productId }));
    };

    return (
        <AdminLayout title="Product Catalog">
            <Head title="Admin - Products" />

            <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-4 border-4 border-border shadow-shadow">
                    <p className="font-heading uppercase italic text-foreground/60">Manage your menu items</p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <Dialog.Trigger asChild>
                            <Button className="px-6 h-12 text-lg">Create Product</Button>
                        </Dialog.Trigger>
                        <Dialog.Content className="sm:max-w-[425px] p-0 overflow-hidden">
                            <Dialog.Header className="bg-main text-main-foreground font-heading uppercase text-xl p-4">
                                Add New Product
                            </Dialog.Header>
                            <div className="p-6 bg-white max-h-[80vh] overflow-y-auto">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-heading">Product Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            placeholder="e.g., Cold Brew"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-xs font-heading">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price" className="font-heading">Price ($)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={data.price}
                                            onChange={(e) => setData("price", e.target.value)}
                                            placeholder="4.50"
                                            required
                                        />
                                        {errors.price && <p className="text-red-500 text-xs font-heading">{errors.price}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="font-heading">Category</Label>
                                        <select
                                            id="category"
                                            className="w-full h-10 px-4 border-2 border-border rounded-base font-base focus:outline-none focus:border-main shadow-shadow appearance-none bg-white"
                                            value={data.category_id}
                                            onChange={(e) => setData("category_id", e.target.value)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        {errors.category_id && <p className="text-red-500 text-xs font-heading">{errors.category_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="image" className="font-heading">Image URL</Label>
                                        <Input
                                            id="image"
                                            value={data.image}
                                            onChange={(e) => setData("image", e.target.value)}
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        <p className="text-[10px] italic opacity-50">Paste a direct link to an image.</p>
                                        {errors.image && <p className="text-red-500 text-xs font-heading">{errors.image}</p>}
                                    </div>

                                    <Button disabled={processing} className="w-full h-12 text-lg">
                                        {processing ? "Saving..." : "Save Product"}
                                    </Button>
                                </form>
                            </div>
                        </Dialog.Content>
                    </Dialog>
                </div>

                {/* List */}
                <Card className="border-4 border-border shadow-shadow bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead className="bg-black text-white font-heading uppercase text-sm border-b-4 border-border">
                                <tr>
                                    <th className="p-4 border-r-2 border-border w-16">IMG</th>
                                    <th className="p-4 border-r-2 border-border">Name</th>
                                    <th className="p-4 border-r-2 border-border">Category</th>
                                    <th className="p-4 border-r-2 border-border text-center">Price</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="font-base text-sm divide-y-2 divide-border">
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-foreground/40 italic">
                                            No products found.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((product) => (
                                        <tr key={product.id} className="hover:bg-main/5 transition-colors">
                                            <td className="p-2 border-r-2 border-border">
                                                <div className="w-12 h-12 bg-gray-100 border-2 border-border rounded-base flex items-center justify-center overflow-hidden">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px] font-heading opacity-20 uppercase">No Img</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 border-r-2 border-border font-heading">{product.name}</td>
                                            <td className="p-4 border-r-2 border-border opacity-70 italic">{product.category?.name}</td>
                                            <td className="p-4 border-r-2 border-border text-center font-heading text-main">${product.price}</td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => toggleAvailability(product.id)}
                                                    className={`px-3 py-1.5 rounded-base border-2 font-heading text-[10px] uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer ${
                                                        product.is_available ? "bg-green-400 border-border text-black" : "bg-red-400 border-border text-black"
                                                    }`}
                                                >
                                                    {product.is_available ? "Available" : "Sold Out"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {products.links && products.links.length > 3 && (
                        <div className="p-4 border-t-4 border-border bg-secondary/10 flex justify-center gap-2 flex-wrap">
                            {products.links.map((link, index) => (
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
        </AdminLayout>
    );
}
