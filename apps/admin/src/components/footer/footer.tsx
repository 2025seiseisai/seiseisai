import dayjs from "@seiseisai/date";
export default function Footer() {
    const currentYear = dayjs().tz().year();
    return (
        <footer className="w-full py-4 text-gray-400">
            <div className="container mx-auto text-center">
                <p className="text-xs font-medium sm:text-sm">
                    © {currentYear === 2025 ? "2025" : `2025-${currentYear}`} 東大寺学園文化祭実行委員会, Created by PR
                    Part
                </p>
            </div>
        </footer>
    );
}
