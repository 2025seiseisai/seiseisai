"use client";
import { useSession } from "@/impl/auth-client";
import { Button } from "@seiseisai/ui/components/button";
import Link from "next/link";

export default function TicketsPageBase({ children }: { children?: React.ReactNode }) {
    const session = useSession();
    return (
        <div className="mx-auto w-full max-w-[calc(100vw-2rem)] sm:w-[52rem]">
            <h1 className="mt-2 mb-6 w-full text-center text-4xl font-bold">整理券</h1>
            <div className="mb-6 flex w-full gap-2 not-sm:flex-col sm:gap-4">
                {session.authorityTickets && (
                    <Button variant="outline" size="lg" className="sm:flex-1" asChild>
                        <Link href="/tickets/help">ヘルプ</Link>
                    </Button>
                )}
                {session.authorityUserAuthentication && (
                    <Button variant="outline" size="lg" className="sm:flex-1" asChild>
                        <Link href="/tickets/authenticate">来場者の認証</Link>
                    </Button>
                )}
                {session.authorityTicketVerification && (
                    <Button variant="outline" size="lg" className="sm:flex-1" asChild>
                        <Link href="/tickets/verify">整理券の検証</Link>
                    </Button>
                )}
            </div>
            {children}
        </div>
    );
}
