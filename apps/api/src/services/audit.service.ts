type AuditEvent = {
  action: string;
  actorId: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
};

// TODO: reemplazar por almacenamiento persistente (Mongo/ClickHouse) cuando definamos el panel de admin.
export async function recordAudit(event: AuditEvent): Promise<void> {
  const payload = {
    ...event,
    timestamp: event.timestamp ?? new Date(),
  };

  if (process.env.NODE_ENV !== 'test') {
    console.info('[audit]', JSON.stringify(payload));
  }
}
