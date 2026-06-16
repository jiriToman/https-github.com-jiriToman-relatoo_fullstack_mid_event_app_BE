import {
  EVENT_STATUSES,
  type EventStatus,
} from "../models/event.model.js";
import mongoose from "mongoose";

type Ok<T> = { ok: true; data: T };
type Fail = { ok: false; error: string };

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function isEventStatus(value: unknown): value is EventStatus {
  return (
    typeof value === "string" &&
    EVENT_STATUSES.includes(value as EventStatus)
  );
}

export function parseCreateEventInput(
  body: Record<string, unknown>,
): Ok<Record<string, unknown>> | Fail {
  const data: Record<string, unknown> = {};

  if (!("title" in body)) return { ok: false, error: "title is required" };
  if (typeof body.title !== "string" || !body.title.trim()) {
    return { ok: false, error: "title must be a non-empty string" };
  }
  data.title = body.title.trim();

  if ("description" in body) {
    if (body.description !== undefined && typeof body.description !== "string") {
      return { ok: false, error: "description must be a string" };
    }
    data.description = body.description?.trim() || undefined;
  }

  if (!("date" in body)) return { ok: false, error: "date is required" };
  const date = new Date(body.date as string);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "date must be a valid date" };
  }
  if (date.getTime() <= Date.now()) {
    return { ok: false, error: "date must be in the future" };
  }
  data.date = date;

  if ("location" in body) {
    if (typeof body.location !== "string" || !body.location.trim()) {
      return { ok: false, error: "location must be a non-empty string" };
    }
    data.location = body.location.trim();
  }

  if ("status" in body) {
    if (!isEventStatus(body.status)) {
      return {
        ok: false,
        error: `status must be one of: ${EVENT_STATUSES.join(", ")}`,
      };
    }
    data.status = body.status;
  }

  return { ok: true, data };
}

export function parseStatusInput(
  body: Record<string, unknown>,
): Ok<{ status: EventStatus }> | Fail {
  if (!("status" in body)) return { ok: false, error: "status is required" };
  if (!isEventStatus(body.status)) {
    return {
      ok: false,
      error: `status must be one of: ${EVENT_STATUSES.join(", ")}`,
    };
  }
  return { ok: true, data: { status: body.status } };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseEventFilters(
  query: Record<string, unknown>,
): Ok<Record<string, unknown>> | Fail {
  const filter: Record<string, unknown> = {};

  if (query.status !== undefined) {
    if (!isEventStatus(query.status)) {
      return {
        ok: false,
        error: `status must be one of: ${EVENT_STATUSES.join(", ")}`,
      };
    }
    filter.status = query.status;
  }

  if (query.from !== undefined) {
    const from =
      typeof query.from === "string" ? new Date(query.from) : new Date(NaN);
    if (Number.isNaN(from.getTime())) {
      return { ok: false, error: "from must be a valid date" };
    }
    filter.date = { ...(filter.date as object), $gte: from };
  }

  if (query.to !== undefined) {
    const to = typeof query.to === "string" ? new Date(query.to) : new Date(NaN);
    if (Number.isNaN(to.getTime())) {
      return { ok: false, error: "to must be a valid date" };
    }
    filter.date = { ...(filter.date as object), $lte: to };
  }

  if (query.title !== undefined) {
    if (typeof query.title !== "string" || !query.title.trim()) {
      return { ok: false, error: "title must be a non-empty string" };
    }
    filter.title = {
      $regex: escapeRegex(query.title.trim()),
      $options: "i",
    };
  }

  return { ok: true, data: filter };
}
