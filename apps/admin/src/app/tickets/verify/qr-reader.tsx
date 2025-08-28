"use client";
import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";

export default function QRReader() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const offscreenRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number | null>(null);
    const [errmsg, setErrmsg] = useState<string | null>(null);
    const [result, setResult] = useState<string>("");

    useEffect(() => {
        let stream: MediaStream | null = null;
        let cancelled = false;

        const init = async () => {
            const getStream = async () => {
                try {
                    return await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: { ideal: "environment" } },
                        audio: false,
                    });
                } catch {
                    return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                }
            };
            try {
                stream = await getStream();
                if (cancelled) return;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play().catch(() => {});
                    // サイズ確定後にキャンバス初期化
                    const w = videoRef.current.videoWidth || 640;
                    const h = videoRef.current.videoHeight || 480;
                    if (canvasRef.current) {
                        canvasRef.current.width = w;
                        canvasRef.current.height = h;
                    }
                    if (!offscreenRef.current) {
                        offscreenRef.current = document.createElement("canvas");
                    }
                    offscreenRef.current.width = w;
                    offscreenRef.current.height = h;
                    loop();
                }
            } catch (e) {
                if (cancelled) return;
                setErrmsg(e instanceof Error ? e.message : "不明なエラー");
            }
        };

        const drawLine = (
            ctx: CanvasRenderingContext2D,
            p1: { x: number; y: number },
            p2: { x: number; y: number },
            color: string,
        ) => {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.stroke();
        };

        const loop = () => {
            if (cancelled) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const off = offscreenRef.current;
            if (video && canvas && off) {
                const ctx = canvas.getContext("2d");
                const octx = off.getContext("2d");
                if (ctx && octx && video.readyState === video.HAVE_ENOUGH_DATA) {
                    const w = off.width;
                    const h = off.height;
                    octx.drawImage(video, 0, 0, w, h);
                    const imageData = octx.getImageData(0, 0, w, h);
                    const qr = jsQR(imageData.data, w, h, { inversionAttempts: "attemptBoth" });
                    // 映像を表示用にも描画
                    ctx.drawImage(video, 0, 0, w, h);
                    if (qr) {
                        setResult(qr.data);
                        // QRの四隅を描画
                        drawLine(ctx, qr.location.topLeftCorner, qr.location.topRightCorner, "#00FF00");
                        drawLine(ctx, qr.location.topRightCorner, qr.location.bottomRightCorner, "#00FF00");
                        drawLine(ctx, qr.location.bottomRightCorner, qr.location.bottomLeftCorner, "#00FF00");
                        drawLine(ctx, qr.location.bottomLeftCorner, qr.location.topLeftCorner, "#00FF00");
                        // テキスト背景
                        const txt = qr.data;
                        ctx.font = "16px sans-serif";
                        ctx.fillStyle = "rgba(0,0,0,0.6)";
                        const metrics = ctx.measureText(txt);
                        const pad = 8;
                        const boxW = metrics.width + pad * 2;
                        const boxH = 24;
                        ctx.fillRect(0, 0, boxW, boxH);
                        ctx.fillStyle = "#FFF";
                        ctx.fillText(txt, pad, 17);
                    }
                }
            }
            rafRef.current = requestAnimationFrame(loop);
        };

        init();

        return () => {
            cancelled = true;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full">
                <canvas ref={canvasRef} className="mx-auto h-full max-h-[75svh] max-w-full rounded-lg bg-black" />
                <video ref={videoRef} playsInline muted className="invisible absolute" />
            </div>
            {errmsg && <div className="text-red-600">カメラの初期化に失敗しました: {errmsg}</div>}
            <div className="text-base">読み取り結果: {result || "(未検出)"}</div>
        </div>
    );
}
