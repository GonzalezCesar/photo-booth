export interface IPrinterService {
  readonly id: string;
  print(photoBuffer: Buffer): Promise<void>;
}