"use client";
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { signOut } from "next-auth/react";

export function LogoutButton() {
    return (
        <AlertDialogAction
            onClick={() => {
                signOut({ redirectTo: "/login" });
            }}
        >
            ログアウト
        </AlertDialogAction>
    );
}
