"use client";
import { AlertDialogAction } from "@seiseisai/ui/components/alert-dialog";
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
