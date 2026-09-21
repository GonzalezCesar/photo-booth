import type { CameraDriver } from "./camera-driver";

export class MockCameraDriver implements CameraDriver {
  readonly id = "mock-camera";
  private canvas: HTMLCanvasElement | null = null;
  private mediaStream: MediaStream | null = null;
  private rafId: number | null = null;
  private frame = 0;

  async start(): Promise<MediaStream> {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.mediaStream = this.canvas.captureStream(30);
    this.frame = 0;
    this.renderFrame();
    return this.mediaStream;
  }

  stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;
    this.canvas = null;
  }

  private renderFrame = () => {
    if (this.canvas) {
      const ctx = this.canvas.getContext("2d");
      if (ctx) {
        const { width: w, height: h } = this.canvas;
        this.frame += 1;
        const hue = (this.frame * 0.8) % 360;
        ctx.fillStyle = `hsl(${hue}, 60%, 45%)`;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc((this.frame * 3) % (w + 100) - 50, h / 2, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "28px sans-serif";
        ctx.fillStyle = "#111";
        ctx.fillText("MOCK CAMERA", 20, 42);
      }
    }
    this.rafId = requestAnimationFrame(this.renderFrame);
  };
}