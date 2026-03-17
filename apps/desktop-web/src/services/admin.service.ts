import { getJson } from "./httpClient";

export type EventLogDTO = {
  visitorId: string;
  sessionId?: string;
  type: string;
  data?: Record<string, unknown> | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: string;
};

export async function fetchEventLogs(token: string): Promise<EventLogDTO[]> {
  return getJson<EventLogDTO[]>("/api/v1/events/log", token);
}
