import type { IPrinterService } from "./printer.interface";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockPrinterService implements IPrinterService {
  readonly id = "mock";

  async print(photoBuffer: Buffer): Promise<void> {
    await delay(150);
    console.log(`[printer:mock] print(${photoBuffer.byteLength} bytes) — no physical printer attached`);
  }
}

export class LpPrinterService implements IPrinterService {
  readonly id = "lp";

  constructor(private readonly printerName?: string) {}

  async print(_photoBuffer: Buffer): Promise<void> {
    // TODO: spawn `lp` (CUPS) with photoBuffer and wait for completion.
    // Requires a local CUPS daemon and configured printer. Implemented
    // when hardware printing lands (Fase hardware).
    throw new Error("LpPrinterService not implemented yet");
  }
}