export interface CameraDriver {
  readonly id: string;
  start(): Promise<MediaStream>;
  stop(): void;
}