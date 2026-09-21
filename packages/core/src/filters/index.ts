import type { ImageFilter } from "./types";

export const AVAILABLE_FILTERS: ImageFilter[] = [
  {
    id: "vintage-gold",
    name: "Vintage Gold",
    config: { brightness: 1.1, contrast: 1.2, saturate: 1.0, hueRotate: 20, sepia: 0.3 },
  },
  {
    id: "bw-dramatic",
    name: "B&W Dramatic",
    config: { brightness: 1.0, contrast: 1.5, saturate: 0, hueRotate: 0, sepia: 0 },
  },
  {
    id: "fuerte",
    name: "Fuerte",
    config: { brightness: 1.0, contrast: 1.2, saturate: 1.1, hueRotate: -10, sepia: 0.05 },
  },
  {
    id: "suave",
    name: "Suave",
    config: { brightness: 1.45, contrast: 0.85, saturate: 0.9, hueRotate: 0, sepia: 0 },
  },
];

export function getFilterById(id: string): ImageFilter | undefined {
  return AVAILABLE_FILTERS.find((filter) => filter.id === id);
}

export { type FilterConfig, type ImageFilter } from "./types";