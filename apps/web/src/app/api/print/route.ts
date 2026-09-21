import { buildFileName } from "@photobooth/core";
import { randomUUID } from "node:crypto";
import { createCameraService } from "@/lib/camera";
import { createPrinterService } from "@/lib/printer";

interface PrintRequest {
  filterId?: string;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let photoBuffer: Buffer | undefined;
  let filterId: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    filterId = (formData.get("filterId") as string | null) ?? null;
    const file = formData.get("photo");
    if (file instanceof File) {
      photoBuffer = Buffer.from(await file.arrayBuffer());
    }
  } else {
    let payload: PrintRequest = {};
    try {
      payload = await request.json();
    } catch {
      // empty body is allowed
    }
    filterId = payload.filterId ?? null;
  }

  const camera = createCameraService();
  const printer = createPrinterService();

  const photo = photoBuffer ?? (await camera.capture());
  await printer.print(photo);

  const sessionId = randomUUID();
  const fileName = buildFileName(sessionId, 1);

  return Response.json({
    ok: true,
    printer: printer.id,
    camera: camera.id,
    filterId,
    fileName,
    bytes: photo.byteLength,
  });
}