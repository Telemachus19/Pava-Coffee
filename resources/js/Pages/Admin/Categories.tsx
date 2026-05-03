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

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface CategoriesProps {
    categories: PaginatedData<Category>;
}

export default function Categories({ categories }: CategoriesProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset } = useForm({
        name: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingCategory) {
            patch(route("admin.categories.update", { category: editingCategory.id }), {
                onSuccess: () => {
                    closeDialog();
                },
            });
        } else {
            post(route("admin.categories.store"), {
                onSuccess: () => {
                    closeDialog();
                },
            });
        }
    };

    const startEdit = (category: Category) => {
        setEditingCategory(category);
        setData("name", category.name);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        reset();
    };

    const deleteCategory = (category: Category) => {
        if (confirm(`Are you sure you want to remove ${category.name}?`)) {
            destroy(route("admin.categories.destroy", { category: category.id }));
        }
    };

    return (
        <AdminLayout title="Menu Categories">
            <Head title="Admin - Categories" />

            <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-4 border-4 border-border shadow-shadow">
                    <p className="font-heading uppercase italic text-foreground/60">Organize your products</p>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
                        <Dialog.Trigger asChild>
                            <Button onClick={() => setIsDialogOpen(true)} className="px-6 h-12 text-lg">Create Category</Button>
                        </Dialog.Trigger>
                        <Dialog.Content className="sm:max-w-[425px] p-0 overflow-hidden">
                            <Dialog.Header className="bg-main text-main-foreground font-heading uppercase text-xl p-4">
                                {editingCategory ? "Edit Category" : "Add New Category"}
                            </Dialog.Header>
                            <div className="p-6 bg-white">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-heading">Category Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            placeholder="e.g., Hot Drinks"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-xs font-heading">{errors.name}</p>}
                                    </div>

                                    <Button disabled={processing} className="w-full h-12 text-lg">
                                        {processing ? "Saving..." : "Save Category"}
                                    </Button>
                                </form>
                            </div>
                        </Dialog.Content>
                    </Dialog>
                </div>

                <Card className="border-4 border-border shadow-shadow bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead className="bg-black text-white font-heading uppercase text-sm border-b-4 border-border">
                                <tr>
                                    <th className="p-4 border-r-2 border-border">Name</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="font-base text-sm divide-y-2 divide-border">
                                {categories.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="p-8 text-center text-foreground/40 italic">
                                            No categories found.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.data.map((category) => (
                                        <tr key={category.id} className="hover:bg-main/5 transition-colors">
                                            <td className="p-4 border-r-2 border-border font-heading">{category.name}</td>
                                            <td className="p-4 text-center space-x-2">
                                                <button 
                                                    onClick={() => startEdit(category)}
                                                    className="px-3 py-1.5 rounded-base border-2 border-border bg-white font-heading text-[10px] uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => deleteCategory(category)}
                                                    className="px-3 py-1.5 rounded-base border-2 border-border bg-red-400 font-heading text-[10px] uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
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
                    {categories.links && categories.links.length > 3 && (
                        <div className="p-4 border-t-4 border-border bg-secondary/10 flex justify-center gap-2 flex-wrap">
                            {categories.links.map((link, index) => (
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
