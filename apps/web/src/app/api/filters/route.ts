import { AVAILABLE_FILTERS } from "@photobooth/core";

export async function GET() {
  return Response.json({ filters: AVAILABLE_FILTERS });
}