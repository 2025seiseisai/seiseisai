export default function Footer() {
    return (
        <footer className="w-full py-4 text-gray-400">
            <div className="container mx-auto text-center">
                <p className="text-sm font-medium">
                    © {new Date().getFullYear()} 東大寺学園文化祭実行委員会, Created by PR Part
                </p>
            </div>
        </footer>
    );
}
