import { Schema, model, type InferSchemaType, type Types } from "mongoose";

export const EVENT_STATUSES = ["draft", "published", "cancelled"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true },
    location: { type: String, trim: true },
    status: {
      type: String,
      enum: EVENT_STATUSES,
      required: true,
      default: "draft",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export type Event = InferSchemaType<typeof eventSchema> & {
  _id: Types.ObjectId;
};

export const EventModel = model<Event>("Event", eventSchema);
