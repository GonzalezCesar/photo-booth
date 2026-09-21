"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AVAILABLE_FILTERS, toCssFilter } from "@photobooth/core";
import type { ImageFilter } from "@photobooth/core";
import { useCamera } from "@/hooks/useCamera";

interface CaptureResult {
  ok: boolean;
  filterId?: string | null;
  fileName?: string;
  bytes?: number;
  printer?: string;
  error?: string;
}

const subscribeToNothing = () => () => {};
const getInsecureClient = () => !window.isSecureContext;
const getInsecureServer = () => false;

export function CameraStage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode] = useState<"webcam" | "mock">(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("camera") === "mock"
      ? "mock"
      : "webcam",
  );
  const [selectedFilter, setSelectedFilter] = useState<ImageFilter>(
    AVAILABLE_FILTERS[0],
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const insecure = useSyncExternalStore(
    subscribeToNothing,
    getInsecureClient,
    getInsecureServer,
  );
  const { stream, status, error, start, stop, isReady } = useCamera(mode);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => () => stop(), [stop]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    setBusy(true);
    setResult(null);
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas 2d unavailable");
      ctx.filter = toCssFilter(selectedFilter.config);
      ctx.drawImage(video, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92),
      );
      if (!blob) throw new Error("frame capture failed");
      const form = new FormData();
      form.append("photo", blob, "photo.jpg");
      form.append("filterId", selectedFilter.id);
      const res = await fetch("/api/print", { method: "POST", body: form });
      const data = (await res.json()) as CaptureResult;
      setResult(data);
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }, [selectedFilter]);

  return (
    <div className="flex flex-1 flex-col bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
              Photo Booth
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Previsualización en vivo
            </h1>
          </div>
          {mode === "mock" && (
            <span className="rounded-full border border-zinc-600 px-3 py-1 font-mono text-xs text-zinc-300">
              driver: mock
            </span>
          )}
        </header>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
          <div className="relative aspect-[4/3] w-full bg-zinc-950">
            {isReady ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: toCssFilter(selectedFilter.config) }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-zinc-500">
                {insecure ? (
                  <div className="max-w-md space-y-2">
                    <p className="text-sm font-medium text-amber-400">
                      Cámara bloqueada por contexto inseguro
                    </p>
                    <p className="text-sm">
                      El navegador solo expone la cámara en HTTPS con un
                      certificado de confianza. Abre esta página por HTTPS e
                      instala la CA de desarrollo en el dispositivo.
                    </p>
                  </div>
                ) : status === "error" ? (
                  <div className="space-y-3">
                    <p className="text-sm">
                      No se pudo iniciar la cámara: {error}
                    </p>
                    <button
                      onClick={() => void start()}
                      className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : status === "starting" ? (
                  <p className="text-sm">Iniciando cámara…</p>
                ) : (
                  <button
                    onClick={() => void start()}
                    className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black"
                  >
                    Encender cámara
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Filtro
          </h2>
          <ul className="grid grid-cols-4 gap-3">
            {AVAILABLE_FILTERS.map((filter) => {
              const active = filter.id === selectedFilter.id;
              return (
                <li key={filter.id}>
                  <button
                    onClick={() => setSelectedFilter(filter)}
                    className={`w-full overflow-hidden rounded-xl border bg-zinc-900 text-left transition ${
                      active
                        ? "border-white"
                        : "border-white/10 hover:border-white/40"
                    }`}
                  >
                    <div
                      className="aspect-video w-full bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-600"
                      style={{ filter: toCssFilter(filter.config) }}
                    />
                    <p
                      className={`truncate px-2 py-1.5 text-xs font-medium ${
                        active ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      {filter.name}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="flex items-center gap-4">
          <button
            onClick={() => void capture()}
            disabled={!isReady || busy}
            className="flex-1 rounded-full bg-white px-6 py-3 font-medium text-black transition enabled:hover:bg-zinc-200 disabled:opacity-40"
          >
            {busy ? "Procesando…" : "Capturar y enviar a impresión"}
          </button>
          {isReady && (
            <button
              onClick={() => stop()}
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/40"
            >
              Apagar
            </button>
          )}
        </div>

        {result && (
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-xs text-zinc-300">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}