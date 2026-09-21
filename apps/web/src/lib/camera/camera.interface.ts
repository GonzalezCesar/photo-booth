export interface IPhotoCaptureService {
  readonly id: string;
  capture(): Promise<Buffer>;
}