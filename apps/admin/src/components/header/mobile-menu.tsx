"use client";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@seiseisai/ui/components/alert-dialog";
import { Button } from "@seiseisai/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@seiseisai/ui/components/popover";
import { LogOut, Menu, User, X } from "lucide-react";
import { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "./logout-button";

type NavItem = {
    href: string;
    label: string;
};

export function MobileMenu({
    navItems,
    session,
}: {
    navItems: NavItem[];
    session: {
        id: string;
        name: string;
    };
}) {
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const close = () => {
            setOpen(false);
        };
        window.addEventListener("resize", close);
        return () => window.removeEventListener("resize", close);
    }, []);
    const pathname = usePathname();
    useEffect(() => {
        setOpen(false);
    }, [pathname]);
    return (
        <div className="md:hidden">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-(--radix-popper-available-width) [transform:translateY(6px)] rounded-none shadow-none duration-100 md:hidden">
                    <nav className="mb-2 flex flex-col gap-1">
                        {navItems.map((item) => (
                            <Button key={item.href} variant="ghost" size="lg" className="px-4">
                                <Link href={item.href as Route} className="w-full py-3 text-start text-xl font-medium">
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                    <div className="border-t px-4 py-3">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <User />
                                <div className="min-w-0">
                                    <p className="truncate text-base font-medium">{session.name}</p>
                                    <p className="truncate text-sm text-gray-500">ID: {session.id}</p>
                                </div>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="w-full">
                                        <LogOut />
                                        ログアウト
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>ログアウトしますか？</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            現在のセッションを終了し、ログイン画面に戻ります。
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                        <LogoutButton />
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
