import { isApiConfigured, postJson } from "./httpClient";

const VISITOR_ID_KEY = "forotrix:visitorId";
const SESSION_ID_KEY = "forotrix:sessionId";
const EVENT_QUEUE_KEY = "forotrix:eventQueue";
const MAX_QUEUE_SIZE = 50;
const MAX_DATA_CHAR_LENGTH = 4000;

type EventPayload = Record<string, unknown> | undefined;

type EventRequestPayload = {
  visitorId: string;
  sessionId: string;
  type: string;
  createdAt: string;
  data?: Record<string, unknown>;
};

type PendingEvent = EventRequestPayload & { internalId: string };

type QueueState = {
  initialized: boolean;
  events: PendingEvent[];
};

const queueState: QueueState = { initialized: false, events: [] };
let flushPromise: Promise<void> | null = null;
let lifecycleEventsBound = false;

const isBrowser = () => typeof window !== "undefined";

function withLocalStorage<T>(cb: (storage: Storage) => T | undefined): T | undefined {
  if (!isBrowser()) return undefined;
  try {
    return cb(window.localStorage);
  } catch {
    return undefined;
  }
}

function withSessionStorage<T>(cb: (storage: Storage) => T | undefined): T | undefined {
  if (!isBrowser()) return undefined;
  try {
    return cb(window.sessionStorage);
  } catch {
    return undefined;
  }
}

function getVisitorId(): string | undefined {
  return withLocalStorage((storage) => storage.getItem(VISITOR_ID_KEY) ?? undefined);
}

function persistVisitorId(id: string) {
  withLocalStorage((storage) => {
    storage.setItem(VISITOR_ID_KEY, id);
    return undefined;
  });
}

function ensureVisitorId(): string {
  const existing = getVisitorId();
  if (existing) return existing;
  const next = generateId();
  persistVisitorId(next);
  return next;
}

function ensureSessionId(): string {
  const stored = withSessionStorage((storage) => storage.getItem(SESSION_ID_KEY) ?? undefined);
  if (stored) return stored;
  const next = generateId();
  withSessionStorage((storage) => {
    storage.setItem(SESSION_ID_KEY, next);
    return undefined;
  });
  return next;
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizePayload(data: EventPayload) {
  if (!data) return undefined;
  try {
    const serialized = JSON.stringify(data);
    if (serialized.length > MAX_DATA_CHAR_LENGTH) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[eventLogger] Dropping payload, exceeds size limit");
      }
      return undefined;
    }
    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function loadQueue(): PendingEvent[] {
  const stored = withLocalStorage((storage) => storage.getItem(EVENT_QUEUE_KEY));
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidPendingEvent).slice(-MAX_QUEUE_SIZE);
  } catch {
    return [];
  }
}

function persistQueue(events: PendingEvent[]) {
  withLocalStorage((storage) => {
    storage.setItem(EVENT_QUEUE_KEY, JSON.stringify(events));
    return undefined;
  });
}

function isValidPendingEvent(value: unknown): value is PendingEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PendingEvent>;
  return (
    typeof candidate.internalId === "string" &&
    typeof candidate.visitorId === "string" &&
    typeof candidate.sessionId === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.createdAt === "string"
  );
}

function bindLifecycleEvents() {
  if (!isBrowser() || lifecycleEventsBound) return;
  lifecycleEventsBound = true;
  window.addEventListener("online", () => {
    void scheduleFlush();
  });
  window.addEventListener("pagehide", () => {
    void scheduleFlush();
  });
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      void scheduleFlush();
    });
  }
}

function ensureQueueInitialized() {
  if (queueState.initialized || !isBrowser()) return;
  queueState.events = loadQueue();
  queueState.initialized = true;
  bindLifecycleEvents();
  void scheduleFlush();
}

function enqueueEvent(event: EventRequestPayload) {
  const pending: PendingEvent = { ...event, internalId: generateId() };
  queueState.events = [...queueState.events.slice(-(MAX_QUEUE_SIZE - 1)), pending];
  persistQueue(queueState.events);
}

function scheduleFlush() {
  if (flushPromise || !queueState.events.length) return flushPromise;
  flushPromise = (async () => {
    try {
      await runFlush();
    } finally {
      flushPromise = null;
    }
  })();
  return flushPromise;
}

async function runFlush() {
  if (!isBrowser() || !queueState.events.length || !isApiConfigured()) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;

  while (queueState.events.length) {
    const [next] = queueState.events;
    try {
      const { internalId: _internalId, ...body } = next;
      await postJson("/events/log", body);
      queueState.events.shift();
      persistQueue(queueState.events);
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[eventLogger] Failed to flush event", error);
      }
      break;
    }
  }
}

export async function logEvent(type: string, data?: Record<string, unknown>) {
  if (!isBrowser() || !isApiConfigured()) return;
  const normalizedType = typeof type === "string" ? type.trim() : "";
  if (!normalizedType) return;
  ensureQueueInitialized();

  const visitorId = ensureVisitorId();
  const sessionId = ensureSessionId();
  const payload: EventRequestPayload = {
    visitorId,
    sessionId,
    type: normalizedType.slice(0, 160),
    data: sanitizePayload(data),
    createdAt: new Date().toISOString(),
  };

  enqueueEvent(payload);
  void scheduleFlush();
}
