"use client";
import { Button } from "@seiseisai/ui/components/button";
import { Maximize } from "lucide-react";
import { useEffect } from "react";

export default function FullscreenButton() {
    useEffect(() => {
        document.addEventListener("fullscreenchange", () => {
            const isFullscreen = document.fullscreenElement !== null;
            if (isFullscreen) {
                const fullscreenStyle = document.createElement("style");
                fullscreenStyle.id = "fullscreen-style";
                fullscreenStyle.textContent = `
    header, #fullscreen-button {
        display: none !important;
    }
    header + div {
        height: calc(var(--spacing) * 6) !important;
    }
`;
                document.head.appendChild(fullscreenStyle);
            } else {
                const fullscreenStyle = document.getElementById("fullscreen-style");
                if (fullscreenStyle) {
                    fullscreenStyle.remove();
                }
            }
        });
    });
    return (
        <Button
            variant="secondary"
            size="icon"
            id="fullscreen-button"
            className="fixed right-6 bottom-6 h-8 w-8 p-0"
            onClick={() => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                }
            }}
        >
            <Maximize />
        </Button>
    );
}
