import type { CameraDriver } from "./camera-driver";
import { WebcamDriver, type WebcamDriverOptions } from "./webcam-driver";
import { MockCameraDriver } from "./mock-driver";

export type CameraMode = "webcam" | "mock";

export function createCameraDriver(
  mode: CameraMode = "webcam",
  options: WebcamDriverOptions = {},
): CameraDriver {
  switch (mode) {
    case "mock":
      return new MockCameraDriver();
    default:
      return new WebcamDriver(options);
  }
}

export type { CameraDriver } from "./camera-driver";
export type { WebcamDriverOptions } from "./webcam-driver";
export { WebcamDriver } from "./webcam-driver";
export { MockCameraDriver } from "./mock-driver";