import type { CameraDriver } from "./camera-driver";

export interface WebcamDriverOptions {
  width?: number;
  height?: number;
  facingMode?: "user" | "environment";
}

export class WebcamDriver implements CameraDriver {
  readonly id = "webcam";
  private stream: MediaStream | null = null;

  constructor(private readonly options: WebcamDriverOptions = {}) {}

  async start(): Promise<MediaStream> {
    if (typeof window !== "undefined" && !window.isSecureContext) {
      throw new Error(
        "La cámara requiere un contexto seguro: abre la página por HTTPS con un certificado de confianza (o en localhost).",
      );
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Este navegador no expone getUserMedia en este contexto. Necesitas HTTPS con un certificado de confianza.",
      );
    }
    const { width = 1280, height = 720, facingMode = "user" } = this.options;
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: width }, height: { ideal: height }, facingMode },
      audio: false,
    });
    return this.stream;
  }

  stop(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}