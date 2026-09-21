export function buildFileName(sessionId: string, shotNumber: number, extension = "jpg"): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `session-${sessionId}-shot-${String(shotNumber).padStart(3, "0")}-${timestamp}.${extension}`;
}