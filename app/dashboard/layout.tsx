"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    // Helper to check if item is active (both inventory root and inventory/register fall under inventory)
    const isInventoryActive = pathname.startsWith("/dashboard");

    return (
        <div className="min-h-screen bg-background font-body-md text-body-md text-on-background">
            {/* SideNavBar */}
            <nav className="h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col py-spacing-stack-default z-50">
                <div className="px-6 mb-8 mt-2">
                    <Link href="/dashboard" className="hover:opacity-90">
                        <h1 className="font-display-lg text-display-lg text-on-surface">Market Manager</h1>
                    </Link>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Pacote de monitoramento de vendas e estoque</p>
                </div>

                <ul className="flex flex-col flex-grow gap-1 px-4">
                    <li>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors active:scale-95 duration-100"
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                                dashboard
                            </span>
                            <span className="font-body-md text-body-md">Dashboard</span>
                        </Link>
                    </li>
                    {/* Active State: Inventory */}
                    <li>
                        <Link
                            href="/inventory"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors active:scale-95 duration-100 ${isInventoryActive
                                ? "text-secondary font-bold border-r-4 border-secondary bg-surface-container-high"
                                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                                }`}
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: isInventoryActive ? "'FILL' 1" : "'FILL' 0" }}>
                                inventory_2
                            </span>
                            <span className="font-body-md text-body-md">Inventory</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/sales"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors active:scale-95 duration-100"
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                                receipt_long
                            </span>
                            <span className="font-body-md text-body-md">Sales</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/reports"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors active:scale-95 duration-100"
                        >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                                analytics
                            </span>
                            <span className="font-body-md text-body-md">Reports</span>
                        </Link>
                    </li>
                </ul>

                <div className="px-6 mt-auto">
                    <div className="flex items-center gap-3 pt-4 border-t border-outline-variant">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden relative">
                            <Image
                                alt="User profile photo"
                                className="object-cover"
                                src="/user_profile.png"
                                fill
                                sizes="40px"
                            />
                        </div>
                        <div>
                            <p className="font-body-md text-body-md font-semibold text-on-surface">Seller Account</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">Pro Tier</p>
                        </div>
                    </div>
                </div>
            </nav>

            {/* TopNavBar */}
            <header className="fixed top-0 right-0 z-40 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center px-8 py-3 w-[calc(100%-16rem)] h-16">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-64 focus-within:ring-2 focus-within:ring-secondary rounded-DEFAULT">
                        <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                            search
                        </span>
                        <input
                            className="w-full bg-surface-container-low border-none rounded-DEFAULT py-1.5 pl-8 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
                            placeholder="Buscar produto..."
                            type="text"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all focus-within:ring-2 focus-within:ring-secondary cursor-pointer">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-all focus-within:ring-2 focus-within:ring-secondary cursor-pointer">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </header>

            {/* Main Content Canvas */}
            <main className="ml-64 pt-20 p-margin-x pb-24">
                {children}
            </main>
        </div>
    );
}
