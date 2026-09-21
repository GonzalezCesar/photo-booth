"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  AVAILABLE_FILTERS,
  AVAILABLE_FRAMES,
  AVAILABLE_LAYOUTS,
  toCssFilter,
} from "@photobooth/core";
import { useCamera } from "@/hooks/useCamera";
import { usePhotoSession } from "@/hooks/usePhotoSession";
import { compose } from "@/lib/composition";
import { ComingSoonModal } from "./ComingSoonModal";

const subscribeToNothing = () => () => {};
const getInsecureClient = () => !window.isSecureContext;
const getInsecureServer = () => false;

export function CameraStage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement>(null);
  const [mode] = useState<"webcam" | "mock">(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("camera") === "mock"
      ? "mock"
      : "webcam",
  );
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const insecure = useSyncExternalStore(
    subscribeToNothing,
    getInsecureClient,
    getInsecureServer,
  );

  const {
    selectedFilter,
    setSelectedFilter,
    selectedFrame,
    setSelectedFrame,
    selectedLayout,
    setSelectedLayout,
    capturedPhotos,
    addPhoto,
    canCapture,
    isComplete,
    resetSession,
  } = usePhotoSession();

  const { stream, status, error, start, stop, isReady } = useCamera(mode);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => () => stop(), [stop]);

  const capture = useCallback(async () => {
    const video = videoRef.current;
    const canvas = offscreenRef.current;
    if (!video || !canvas || !canCapture) return;

    setBusy(true);
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
      if (!blob) throw new Error("capture failed");

      addPhoto(blob);
    } catch (err) {
      console.error("capture error:", err);
    } finally {
      setBusy(false);
    }
  }, [selectedFilter, canCapture, addPhoto]);

  const handleDownload = useCallback(async () => {
    if (capturedPhotos.length === 0) return;
    setDownloading(true);
    try {
      const bitmaps = await Promise.all(
        capturedPhotos.map((p) => createImageBitmap(p.blob)),
      );
      const result = await compose({
        photos: bitmaps,
        frame: selectedFrame.id === "none" ? null : selectedFrame,
        layout: selectedLayout,
      });
      const blob = await result.toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `photo-booth-${selectedLayout.id}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      resetSession();
    } catch (err) {
      console.error("download error:", err);
    } finally {
      setDownloading(false);
    }
  }, [capturedPhotos, selectedFrame, selectedLayout, resetSession]);

  const captureLabel = isComplete
    ? "¡Listo!"
    : busy
      ? "Capturando…"
      : `Capturar (${capturedPhotos.length + 1}/${selectedLayout.photoRegions.length})`;

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

        {/* Camera preview */}
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
                      certificado de confianza. Abre la página por HTTPS o
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

        {/* Layout selector */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Layout
          </h2>
          <ul className="grid grid-cols-3 gap-3">
            {AVAILABLE_LAYOUTS.map((layout) => {
              const active = layout.id === selectedLayout.id;
              return (
                <li key={layout.id}>
                  <button
                    onClick={() => setSelectedLayout(layout)}
                    disabled={capturedPhotos.length > 0}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      active
                        ? "border-white bg-zinc-800"
                        : "border-white/10 bg-zinc-900 hover:border-white/40"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <p className={`text-sm font-medium ${active ? "text-white" : "text-zinc-300"}`}>
                      {layout.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {layout.photoRegions.length} foto{layout.photoRegions.length > 1 ? "s" : ""} · {layout.width}×{layout.height}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Filter selector */}
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

        {/* Frame selector */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            Marco
          </h2>
          <ul className="grid grid-cols-3 gap-3">
            {AVAILABLE_FRAMES.map((frame) => {
              const active = frame.id === selectedFrame.id;
              return (
                <li key={frame.id}>
                  <button
                    onClick={() => setSelectedFrame(frame)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      active
                        ? "border-white bg-zinc-800"
                        : "border-white/10 bg-zinc-900 hover:border-white/40"
                    }`}
                  >
                    <p className={`text-sm font-medium ${active ? "text-white" : "text-zinc-300"}`}>
                      {frame.name}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Capture progress */}
        {capturedPhotos.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-widest text-zinc-500">
                Capturas ({capturedPhotos.length}/{selectedLayout.photoRegions.length})
              </h2>
              <button
                onClick={resetSession}
                className="text-xs text-zinc-500 underline transition hover:text-zinc-300"
              >
                Limpiar
              </button>
            </div>
            <div className="flex gap-2">
              {capturedPhotos.map((photo, i) => (
                <div
                  key={`capture-${i}`}
                  className="relative h-16 flex-1 overflow-hidden rounded-lg border border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={`Captura ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => void capture()}
            disabled={!isReady || busy || !canCapture}
            className="flex-1 rounded-full bg-white px-6 py-3 font-medium text-black transition enabled:hover:bg-zinc-200 disabled:opacity-40"
          >
            {captureLabel}
          </button>

          <button
            onClick={() => void handleDownload()}
            disabled={!isComplete || downloading}
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/40 disabled:opacity-40"
          >
            {downloading ? "Descargando…" : "Descargar"}
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-zinc-500 transition hover:border-white/40 hover:text-zinc-300"
          >
            Imprimir
          </button>

          {isReady && (
            <button
              onClick={() => stop()}
              className="rounded-full border border-white/15 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/40"
            >
              Apagar
            </button>
          )}
        </div>

        <canvas ref={offscreenRef} className="hidden" />
      </main>

      <ComingSoonModal open={showPrintModal} onClose={() => setShowPrintModal(false)} />
    </div>
  );
}
