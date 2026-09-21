import type { IPhotoCaptureService } from "./camera.interface";

const PLACEHOLDER_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockCameraCapture implements IPhotoCaptureService {
  readonly id = "mock-camera";

  async capture(): Promise<Buffer> {
    await delay(120);
    console.log("[camera:mock] capture() — returning placeholder image");
    return Buffer.from(PLACEHOLDER_PNG);
  }
}

export class WebCameraCapture implements IPhotoCaptureService {
  readonly id = "web-camera";

  async capture(): Promise<Buffer> {
    // TODO: capture a frame from getUserMedia() and encode as JPEG.
    // Requires a running browser session — implemented when the camera
    // UI lands (siguiente iteración).
    throw new Error("WebCameraCapture not implemented yet");
  }
}