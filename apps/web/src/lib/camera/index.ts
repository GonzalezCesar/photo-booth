import type { IPhotoCaptureService } from "./camera.interface";
import { MockCameraCapture, WebCameraCapture } from "./camera.service";

export function createCameraService(driver?: string): IPhotoCaptureService {
  const resolved = driver ?? process.env.CAMERA_DRIVER ?? "mock";
  switch (resolved) {
    case "web":
      return new WebCameraCapture();
    default:
      return new MockCameraCapture();
  }
}

export type { IPhotoCaptureService } from "./camera.interface";
export { MockCameraCapture, WebCameraCapture } from "./camera.service";