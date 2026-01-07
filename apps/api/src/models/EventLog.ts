import { Schema, model } from 'mongoose';

export interface IEventLog {
  visitorId: string;
  sessionId?: string;
  type: string;
  data?: Record<string, unknown> | null;
  userAgent?: string | null;
  ip?: string | null;
  createdAt: Date;
}

const eventLogSchema = new Schema<IEventLog>(
  {
    visitorId: { type: String, required: true, trim: true, index: true },
    sessionId: { type: String, trim: true, index: true, default: null },
    type: { type: String, required: true, trim: true, index: true },
    data: { type: Schema.Types.Mixed, default: null },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

eventLogSchema.index({ createdAt: -1 });

export const EventLog = model<IEventLog>('EventLog', eventLogSchema);
