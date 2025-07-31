"use client";
import { createContext, useContext } from "react";
import { AdminModel } from "./models";

const AuthContext = createContext<AdminModel | null>(null);

export function AuthProvider({ children, session }: { children: React.ReactNode; session: AdminModel | null }) {
    return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
}

export function useSession() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useSession must be used within an AuthProvider");
    }
    return context;
}
