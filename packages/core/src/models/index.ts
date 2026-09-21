export interface Photo {
  id: string;
  fileName: string;
  filterId: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface Session {
  id: string;
  startedAt: string;
  photos: Photo[];
}

export interface User {
  id: string;
  name: string;
  createdAt: string;
}