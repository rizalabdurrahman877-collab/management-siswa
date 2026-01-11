 'use client';

 import React, { useState, useEffect } from "react";
 import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Users, BarChart, X, icons, Icon, BarChart3 } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Sheet, SheetContent } from "../ui/sheet";
import { cn } from "@/lib/utils";
import { on } from "events";
import { supabase } from "@/lib/supabase";

interface userData {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
}

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<userData | null>(null);

    const menuItems = [
        { Label: "Dashboard", icon: Home, href: "/dashboard"},
        { Label: "Siswa", icon: Users, href: "/dashboard/siswa"},
        { Label: "Kelas", icon: BarChart3, href: "/dashboard/kelas"},
        { Label: "Pelanggaran", icon: BarChart3, href: "/dashboard/pelanggaran"},
    ];

    useEffect(() => {
            const fetchUser = async () => {
                try {
                   const { data, error} = await supabase.auth.getUser();
    
                   if (error || !data.user) {
                        console.error("Error fetching user:", error);
                        router.push("/auth/login");
                        return;
                   }
    
                  const name = data.user.user_metadata?.name ||
                  data.user.user_metadata?.full_name ||
                  data.user.email?.split("@")[0] ||
                  "User";
    
                   setUserData({
                    id: data.user.id,
                    email: data.user.email || '',
                    name: name,
                    avatar_url: data.user.user_metadata.avatar_url || null,
                   })
                } catch (error) {
                    console.error("Error fetching user:", error);
                }
            }
            fetchUser();
        }, []);

        const getInitials = (name: string) => {
        return name
            .split('')
            .map(part => part.charAt(0).toUpperCase())
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-background">
            <div className="flex h-16 items-center justify-between px-6 border-b">
                <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-sm">MS</span>
                    </div>
                    <h1 className="tracking-tight font-semibold text-lg">Manajemen Siswa</h1>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                </Button>
            </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map(({ Label, icon: Icon, href }) => {
                        const isActive = href === '/dashboard'
                        ? pathname === '/dashboard'
                        : pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center justify-between w-full rounded-lg  px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-blue-600 text-primary-foreground shadow-sm rounded-2xl"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground bg-gray-200 rounded-2xl"
                                )}
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className="h-4 w-4" />
                                    <span>{Label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/avatar.png" alt="User Avatar" />
                                <AvatarFallback>{getInitials(userData?.name || '')}</AvatarFallback>
                        </Avatar>
                        <div className="flex=1 min-w-0">
                            <p className="text-xm font-medium truncate">
                                {userData?.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {userData?.email}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    );

    return (
        <>
            {/* Dekstop Sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:border-r">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent side="left" className="w-64 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    )
}