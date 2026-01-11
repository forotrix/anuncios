import { Schema, model, Types } from 'mongoose';

export interface IComment {
  ad: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
}

const commentSchema = new Schema<IComment>(
  {
    ad: { type: Schema.Types.ObjectId, ref: 'Ad', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

commentSchema.index({ ad: 1, createdAt: -1 });

export const Comment = model<IComment>('Comment', commentSchema);
