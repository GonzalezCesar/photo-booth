"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCameraDriver,
  type CameraDriver,
  type CameraMode,
} from "@/lib/camera/client";

export type CameraStatus = "idle" | "starting" | "ready" | "error" | "stopped";

export function useCamera(mode: CameraMode = "webcam") {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const driverRef = useRef<CameraDriver | null>(null);

  const start = useCallback(async () => {
    setStatus("starting");
    setError(null);
    const driver = createCameraDriver(mode);
    driverRef.current = driver;
    try {
      const newStream = await driver.start();
      setStream(newStream);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [mode]);

  const stop = useCallback(() => {
    driverRef.current?.stop();
    driverRef.current = null;
    setStream(null);
    setStatus("stopped");
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    stream,
    status,
    error,
    start,
    stop,
    isReady: status === "ready",
  };
}