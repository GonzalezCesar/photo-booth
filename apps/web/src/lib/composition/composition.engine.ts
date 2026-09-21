import type { Frame, Layout } from "@photobooth/core";
import { drawPhotoInRegion } from "./layout-renderer";
import { drawFrameOverlay } from "./frame-renderer";

export interface CompositionInput {
  photos: ImageBitmap[];
  frame?: Frame | null;
  layout: Layout;
}

export interface CompositionResult {
  canvas: HTMLCanvasElement;
  toBlob(type?: string, quality?: number): Promise<Blob>;
}

export async function compose(input: CompositionInput): Promise<CompositionResult> {
  const { photos, frame, layout } = input;

  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, layout.width, layout.height);

  for (let i = 0; i < layout.photoRegions.length; i++) {
    const photo = photos[i % photos.length];
    if (photo) {
      drawPhotoInRegion(ctx, photo, layout.photoRegions[i]);
    }
  }

  if (frame?.assetPath) {
    await drawFrameOverlay(ctx, frame.assetPath, layout.width, layout.height);
  }

  return {
    canvas,
    toBlob(type = "image/jpeg", quality = 0.92): Promise<Blob> {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
          type,
          quality,
        );
      });
    },
  };
}
