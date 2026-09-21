export interface FilterConfig {
  brightness: number;
  contrast: number;
  saturate: number;
  hueRotate: number;
  sepia: number;
}

export interface ImageFilter {
  id: string;
  name: string;
  config: FilterConfig;
}