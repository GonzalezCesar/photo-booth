export interface PhotoRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Layout {
  id: string;
  name: string;
  width: number;
  height: number;
  photoRegions: PhotoRegion[];
}
