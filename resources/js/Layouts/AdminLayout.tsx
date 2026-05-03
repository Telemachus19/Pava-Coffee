import { Link, usePage } from "@inertiajs/react";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { route } from "ziggy-js";

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth } = usePage().props as any;

    const navItems = [
        { name: "Dashboard", href: route("admin.dashboard") },
        { name: "Orders", href: route("admin.orders.index") },
        { name: "Products", href: route("admin.products.index") },
        { name: "Categories", href: route("admin.categories.index") },
        { name: "Locations", href: route("admin.stores.index") },
        { name: "Staff", href: route("admin.staff.index") },
    ];

    return (
        <div className="min-h-screen bg-secondary-background flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-b-2 md:border-b-0 md:border-r-4 border-border flex flex-col shadow-shadow z-10">
                <div className="p-6 border-b-4 border-border bg-main">
                    <Link href="/" className="font-heading text-xl tracking-tighter text-main-foreground italic uppercase">
                        PAVA ADMIN
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-base border-2 font-heading uppercase text-sm transition-all",
                                window.location.href.startsWith(item.href)
                                    ? "bg-main text-main-foreground border-border shadow-shadow"
                                    : "bg-white border-transparent hover:border-border hover:bg-main/5"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t-2 border-border bg-main/5">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-8 h-8 rounded-full bg-secondary border-2 border-border flex items-center justify-center font-heading text-secondary-foreground text-xs">
                            {auth.user?.name[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-heading text-xs truncate">{auth.user?.name}</p>
                            <p className="font-base text-[10px] text-foreground/60 truncate italic">{auth.user?.role?.name}</p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full mt-4 py-2 rounded-base border-2 border-border bg-white font-heading text-xs uppercase shadow-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                    >
                        Logout
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
                {title && (
                    <h1 className="text-4xl font-heading uppercase italic border-b-4 border-main inline-block mb-4">
                        {title}
                    </h1>
                )}
                {children}
            </main>
        </div>
    );
}
