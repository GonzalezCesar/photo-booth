import type { PhotoRegion } from "@photobooth/core";

export function drawPhotoInRegion(
  ctx: CanvasRenderingContext2D,
  photo: ImageBitmap,
  region: PhotoRegion,
): void {
  const photoAspect = photo.width / photo.height;
  const regionAspect = region.width / region.height;

  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;

  if (photoAspect > regionAspect) {
    sh = photo.height;
    sw = sh * regionAspect;
    sx = (photo.width - sw) / 2;
    sy = 0;
  } else {
    sw = photo.width;
    sh = sw / regionAspect;
    sx = 0;
    sy = (photo.height - sh) / 2;
  }

  ctx.drawImage(photo, sx, sy, sw, sh, region.x, region.y, region.width, region.height);
}
