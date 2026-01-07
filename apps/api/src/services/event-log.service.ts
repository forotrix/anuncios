import { EventLog, type IEventLog } from '../models/EventLog';

export type EventLogInput = {
  visitorId: string;
  sessionId?: string;
  type: string;
  data?: Record<string, unknown> | null;
  createdAt?: Date;
  userAgent?: string | null;
  ip?: string | null;
};

function sanitizeEventData(data?: Record<string, unknown> | null) {
  if (!data) return null;
  try {
    const serialized = JSON.stringify(data);
    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function storeEventLog(input: EventLogInput): Promise<IEventLog> {
  const payload = {
    visitorId: input.visitorId.trim(),
    sessionId: input.sessionId?.trim() || null,
    type: input.type.trim(),
    data: sanitizeEventData(input.data),
    userAgent: input.userAgent ?? null,
    ip: input.ip ?? null,
    createdAt: input.createdAt ?? new Date(),
  };

  return EventLog.create(payload);
}
