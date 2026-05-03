import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { Dialog } from "@/components/retroui/Dialog";
import { Head, useForm, Link } from "@inertiajs/react";
import React, { useState } from "react";
import { route } from "ziggy-js";
import { cn } from "@/lib/utils";

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
}

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
}

interface StaffProps {
    staff: PaginatedData<User>;
    roles: Role[];
}

export default function Staff({ staff, roles }: StaffProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        role_id: "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("admin.staff.store"), {
            onSuccess: () => {
                reset("password");
                setIsDialogOpen(false);
            },
        });
    };

    return (
        <AdminLayout title="Staff Management">
            <Head title="Admin - Staff" />

            <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-4 border-4 border-border shadow-shadow">
                    <p className="font-heading uppercase italic text-foreground/60">Manage team access</p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <Dialog.Trigger asChild>
                            <Button className="px-6 h-12 text-lg">Create Staff</Button>
                        </Dialog.Trigger>
                        <Dialog.Content className="sm:max-w-[425px] p-0 overflow-hidden">
                            <Dialog.Header className="bg-main text-main-foreground font-heading uppercase text-xl p-4">
                                Add New Staff Account
                            </Dialog.Header>
                            <div className="p-6 bg-white">
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-heading">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            placeholder="Jane Doe"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-xs font-heading">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="font-heading">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData("email", e.target.value)}
                                            placeholder="jane@pava.coffee"
                                            required
                                        />
                                        {errors.email && <p className="text-red-500 text-xs font-heading">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="font-heading">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData("password", e.target.value)}
                                            required
                                        />
                                        {errors.password && <p className="text-red-500 text-xs font-heading">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="font-heading">Assign Role</Label>
                                        <select
                                            id="role"
                                            className="w-full h-10 px-4 border-2 border-border rounded-base font-base focus:outline-none focus:border-main shadow-shadow appearance-none bg-white"
                                            value={data.role_id}
                                            onChange={(e) => setData("role_id", e.target.value)}
                                            required
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                        {errors.role_id && <p className="text-red-500 text-xs font-heading">{errors.role_id}</p>}
                                    </div>

                                    <Button disabled={processing} className="w-full h-12 text-lg">
                                        {processing ? "Creating..." : "Save Account"}
                                    </Button>
                                </form>
                            </div>
                        </Dialog.Content>
                    </Dialog>
                </div>

                {/* List */}
                <Card className="border-4 border-border shadow-shadow bg-white overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead className="bg-black text-white font-heading uppercase text-sm border-b-4 border-border">
                                <tr>
                                    <th className="p-4 border-r-2 border-border">Name</th>
                                    <th className="p-4 border-r-2 border-border">Email</th>
                                    <th className="p-4 text-center">Role</th>
                                </tr>
                            </thead>
                            <tbody className="font-base text-sm divide-y-2 divide-border">
                                {staff.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-foreground/40 italic">
                                            No staff accounts found.
                                        </td>
                                    </tr>
                                ) : (
                                    staff.data.map((member) => (
                                        <tr key={member.id} className="hover:bg-main/5 transition-colors">
                                            <td className="p-4 border-r-2 border-border font-heading">{member.name}</td>
                                            <td className="p-4 border-r-2 border-border opacity-70">{member.email}</td>
                                            <td className="p-4 text-center">
                                                <Badge className={cn(
                                                    "border-2 border-border font-heading text-[10px] uppercase",
                                                    member.role?.name === 'Admin' ? "bg-black text-white" : "bg-white text-black"
                                                )}>
                                                    {member.role?.name}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {staff.links && staff.links.length > 3 && (
                        <div className="p-4 border-t-4 border-border bg-secondary/10 flex justify-center gap-2 flex-wrap">
                            {staff.links.map((link, index) => (
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

// Inline Badge component as it might not be exported from retroui/Badge or we want custom style
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={cn("px-2 py-1 rounded-base border-2 font-heading text-[10px] uppercase inline-block", className)}>
            {children}
        </span>
    );
}
