'use client';

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

interface userData {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
}

export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const [userData, setUserData] = useState<userData | null>(null);
    const [loading, setLoading] = useState(false);
    const menuMap: Record<string, string> = {};

    const title = menuMap[pathname] || "SMK NEGERI 1 Pasuruan";

    const handlelogout = async() => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                alert(error.message);
                return;
            }
            router.push("/auth/login");
            localStorage.clear();
        } catch (error) {
            console.error("Gagal saat Logout:", error);
        }
    }

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

    return(
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="mx-auto flex h-15 items-center justify-between px-6">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg-hidden"
                        onClick={onMenuClick}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full mx-3">
                                <Avatar>
                                    <AvatarImage src="/avatar.png" alt="User Avatar" />
                                    <AvatarFallback>{getInitials(userData?.name || '')}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-white shadow-md border" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p  className="text-sm font-medium leading-none">
                                        Rizal Abdurakhman Wakhid
                                    </p>
                                    <p className="text-sm leading-none text-muted-foreground">
                                        rizalabdurrahman603@gmail.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={handlelogout}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}