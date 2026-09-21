import type { Layout } from "./types";

export type { Layout, PhotoRegion } from "./types";

export const AVAILABLE_LAYOUTS: Layout[] = [
  {
    id: "single",
    name: "Simple",
    width: 1080,
    height: 1920,
    photoRegions: [{ x: 0, y: 0, width: 1080, height: 1920 }],
  },
  {
    id: "strip-3",
    name: "Tira Vertical",
    width: 600,
    height: 1600,
    photoRegions: [
      { x: 50, y: 50, width: 500, height: 450 },
      { x: 50, y: 550, width: 500, height: 450 },
      { x: 50, y: 1050, width: 500, height: 450 },
    ],
  },
  {
    id: "album-2",
    name: "Álbum Horizontal",
    width: 1920,
    height: 1080,
    photoRegions: [
      { x: 40, y: 40, width: 900, height: 1000 },
      { x: 980, y: 40, width: 900, height: 1000 },
    ],
  },
];

export function getLayoutById(id: string): Layout | undefined {
  return AVAILABLE_LAYOUTS.find((layout) => layout.id === id);
}
