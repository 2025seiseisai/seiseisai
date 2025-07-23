import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { auth } from "@/impl/auth";
import { LogIn, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default async function Header() {
    const session = await auth();
    return (
        <>
            <header className="fixed z-10 flex h-14 w-full items-center bg-white">
                <h1 className="mr-2.5 ml-4 text-xl font-semibold">管理ページ</h1>
                <NavigationMenu className="h-full w-full">
                    <NavigationMenuList className="gap-0.5">
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/" className="font-medium">
                                    ホーム
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/news" className="font-medium">
                                    ニュース
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/goods" className="font-medium">
                                    グッズ
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/tickets" className="font-medium">
                                    整理券
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link href="/admins" className="font-medium">
                                    管理者
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="mr-4 ml-auto">
                    {session ? (
                        <User />
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
