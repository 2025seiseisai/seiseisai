"use client";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "../ui/button";

export function LogoutButton() {
    return (
        <Button
            variant="ghost"
            className="w-full"
            size="sm"
            onClick={() => {
                signOut({ redirectTo: "/login" });
            }}
        >
            <LogOut />
            ログアウト
        </Button>
    );
}
