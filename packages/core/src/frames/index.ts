import type { Frame } from "./types";

export type { Frame } from "./types";

export const AVAILABLE_FRAMES: Frame[] = [
  { id: "none", name: "Sin marco", assetPath: "" },
  { id: "polaroid", name: "Polaroid", assetPath: "/frames/polaroid.png" },
  { id: "film-strip", name: "Film Strip", assetPath: "/frames/film-strip.png" },
];

export function getFrameById(id: string): Frame | undefined {
  return AVAILABLE_FRAMES.find((frame) => frame.id === id);
}
