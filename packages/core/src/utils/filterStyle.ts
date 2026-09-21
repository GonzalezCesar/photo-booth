import type { FilterConfig } from "../filters/types";

export function toCssFilter(config: FilterConfig): string {
  return [
    `brightness(${config.brightness})`,
    `contrast(${config.contrast})`,
    `saturate(${config.saturate})`,
    `hue-rotate(${config.hueRotate}deg)`,
    `sepia(${config.sepia})`,
  ].join(" ");
}