import { auth } from "@/impl/auth";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@seiseisai/ui/components/dropdown-menu";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@seiseisai/ui/components/navigation-menu";
import { LogIn, LogOut, User } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { MobileMenu } from "./mobile-menu";

export default async function Header() {
    const session = await auth();
    const navItems: { href: Route; label: string }[] = [];
    if (session) {
        navItems.push({ href: "/" as Route, label: "ホーム" });
        if (session.authorityNews) navItems.push({ href: "/news" as Route, label: "ニュース" });
        if (session.authorityGoods || session.authorityGoodsStock)
            navItems.push({ href: "/goods" as Route, label: "グッズ" });
        if (session.authorityTickets) navItems.push({ href: "/tickets" as Route, label: "整理券" });
        if (session.authorityAdmins) navItems.push({ href: "/admins" as Route, label: "管理者" });
    }
    return (
        <>
            <header className="fixed z-10 flex h-14 w-full items-center bg-white">
                <h1 className="mr-2.5 ml-4 text-xl font-semibold">管理ページ</h1>
                <NavigationMenu className="hidden md:block">
                    <NavigationMenuList className="gap-0.5">
                        {navItems.map((item) => (
                            <NavigationMenuItem key={item.href}>
                                <NavigationMenuLink asChild>
                                    <Link href={item.href} className="font-medium">
                                        {item.label}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="mr-4 ml-auto md:hidden">
                    {session && <MobileMenu navItems={navItems} session={{ id: session.id, name: session.name }} />}
                </div>
                <div className={`mr-4 ml-auto ${session ? "hidden md:block" : ""}`}>
                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost">
                                    <User />
                                    <p className="w-full max-w-40 overflow-hidden text-nowrap text-ellipsis">
                                        {session.name}
                                    </p>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>
                                    <p className="text-[16px]">{session.name}</p>
                                    <p className="mt-1 text-xs font-normal text-gray-500">ID: {session.id}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" className="w-full" size="sm">
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
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button variant="outline" className="mr-2" asChild>
                            <Link href="/login">
                                <LogIn />
                                ログイン
                            </Link>
                        </Button>
                    )}
                </div>
            </header>
            <div className="h-14 w-full" />
        </>
    );
}
