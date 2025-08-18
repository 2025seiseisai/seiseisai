import Footer from "@/components/footer/footer";
import FullscreenButton from "@/components/fullscreen/fullscreen";
import Header from "@/components/header/header";
import "@/impl/global.css";
import { Toaster } from "@seiseisai/ui/components/sonner";
import "@seiseisai/ui/entryPoint.css";
import { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "菁々祭Webサイト管理ページ",
    robots: {
        index: false,
        follow: false,
        noarchive: true,
    },
    formatDetection: {
        telephone: false,
        date: false,
        address: false,
        email: true,
        url: true,
    },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja" className={notoSansJP.className}>
            <body suppressHydrationWarning>
                <Header />
                <main>{children}</main>
                <Footer />
                <FullscreenButton />
                <Toaster richColors theme="light" />
            </body>
        </html>
    );
}
