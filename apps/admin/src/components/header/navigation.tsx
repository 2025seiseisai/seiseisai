"use client";
import { NavigationMenuItem, NavigationMenuLink } from "@seiseisai/ui/components/navigation-menu";
import type { Route } from "next";
import Link from "next/link";

export default function Navigation({ href, label }: { href: Route; label: string }) {
    return (
        <NavigationMenuItem>
            <NavigationMenuLink asChild>
                <Link href={href} className="font-medium">
                    {label}
                </Link>
            </NavigationMenuLink>
        </NavigationMenuItem>
    );
}
