import { Button } from "@seiseisai/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@seiseisai/ui/components/dropdown-menu";
import { ExternalLink, LinkIcon, Menu } from "lucide-react";
import Link from "next/link";

export default function Header() {
    return (
        <>
            <header className="fixed z-10 flex h-14 w-full items-center justify-between bg-white">
                <h1 className="ml-4 text-xl font-semibold">Web整理券</h1>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="mr-4">
                            <Menu />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <Link href="/">
                            <DropdownMenuItem className="py-2">
                                <LinkIcon />
                                トップページ
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/guide">
                            <DropdownMenuItem className="py-2">
                                <LinkIcon />
                                ご利用にあたって
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link href="https://seiseisai.com/">
                            <DropdownMenuItem className="py-2">
                                <ExternalLink />
                                公式サイト
                            </DropdownMenuItem>
                        </Link>
                        <Link href="https://seiseisai.com/events">
                            <DropdownMenuItem className="py-2">
                                <ExternalLink />
                                イベント一覧
                            </DropdownMenuItem>
                        </Link>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <div className="h-14" />
        </>
    );
}
