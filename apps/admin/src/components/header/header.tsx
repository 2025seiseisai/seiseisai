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
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export default async function Header() {
    const session = await auth();
    return (
        <>
            <header className="fixed z-10 flex h-14 w-full items-center bg-white">
                <h1 className="mr-2.5 ml-4 text-xl font-semibold">管理ページ</h1>
                <NavigationMenu className="h-full w-full">
                    <NavigationMenuList className="gap-0.5">
                        {session && (
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/" className="font-medium">
                                        ホーム
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}
                        {session?.authorityNews && (
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/news" className="font-medium">
                                        ニュース
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}
                        {(session?.authorityGoods || session?.authorityGoodsStock) && (
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/goods" className="font-medium">
                                        グッズ
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}
                        {process.env.NODE_ENV === "development" && session?.authorityTickets && (
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/ticket" className="font-medium">
                                        チケット
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}
                        {session?.authorityAdmins && (
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/admins" className="font-medium">
                                        管理者
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        )}
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="mr-4 ml-auto">
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
