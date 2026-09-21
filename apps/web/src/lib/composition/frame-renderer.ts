export async function drawFrameOverlay(
  ctx: CanvasRenderingContext2D,
  assetPath: string,
  width: number,
  height: number,
): Promise<void> {
  if (!assetPath) return;

  const img = await loadImage(assetPath);
  ctx.drawImage(img, 0, 0, width, height);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load frame: ${src}`));
    img.src = src;
  });
}
