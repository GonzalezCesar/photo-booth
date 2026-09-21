import type { IPrinterService } from "./printer.interface";
import { LpPrinterService, MockPrinterService } from "./printer.service";

export function createPrinterService(driver?: string): IPrinterService {
  const resolved = driver ?? process.env.PRINTER_DRIVER ?? "mock";
  switch (resolved) {
    case "lp":
      return new LpPrinterService(process.env.PRINTER_NAME);
    default:
      return new MockPrinterService();
  }
}

export type { IPrinterService } from "./printer.interface";
export { LpPrinterService, MockPrinterService } from "./printer.service";