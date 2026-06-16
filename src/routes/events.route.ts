import { Router } from "express";
import mongoose from "mongoose";

import {
  EVENT_STATUSES,
  EventModel,
  type EventStatus,
} from "../models/event.model.js";

export const eventsRouter = Router();

function errorResponse(error: string, description: string) {
  return { error, description };
}

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function isEventStatus(value: unknown): value is EventStatus {
  return (
    typeof value === "string" &&
    EVENT_STATUSES.includes(value as EventStatus)
  );
}

function parseCreateEventInput(
  body: Record<string, unknown>,
):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string } {
  const data: Record<string, unknown> = {};

  if (!("title" in body)) {
    return { ok: false, error: "title is required" };
  }
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

  if (!("date" in body)) {
    return { ok: false, error: "date is required" };
  }
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

function parseStatusInput(
  body: Record<string, unknown>,
):
  | { ok: true; data: { status: EventStatus } }
  | { ok: false; error: string } {
  if (!("status" in body)) {
    return { ok: false, error: "status is required" };
  }

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

function parseEventFilters(query: Record<string, unknown>):
  | { ok: true; filter: Record<string, unknown> }
  | { ok: false; error: string } {
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

  return { ok: true, filter };
}

/** @openapi
 * /api/events:
 *   get:
 *     operationId: listEvents
 *     tags: [events]
 *     parameters:
 *       - { in: query, name: status, schema: { $ref: "#/components/schemas/EventStatus" } }
 *       - { in: query, name: from, schema: { type: string, format: date-time } }
 *       - { in: query, name: to, schema: { type: string, format: date-time } }
 *       - { in: query, name: title, schema: { type: string } }
 */
eventsRouter.get("/", async (req, res) => {
  const parsed = parseEventFilters(req.query);
  if (!parsed.ok) {
    res.status(400).json(errorResponse("bad_request", parsed.error));
    return;
  }

  const events = await EventModel.find(parsed.filter).sort({ date: 1 }).lean();
  res.json(events);
});

/** @openapi
 * /api/events/{id}:
 *   get:
 *     operationId: getEventById
 *     tags: [events]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 */
eventsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json(errorResponse("invalid_event_id", "Invalid event ID"));
    return;
  }

  const event = await EventModel.findById(id).lean();
  if (!event) {
    res.status(404).json(errorResponse("event_not_found", "Event not found"));
    return;
  }

  res.json(event);
});

/** @openapi
 * /api/events:
 *   post:
 *     operationId: createEvent
 *     tags: [events]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/CreateEventRequest" }
 */
eventsRouter.post("/", async (req, res) => {
  const parsed = parseCreateEventInput(req.body ?? {});
  if (!parsed.ok) {
    res.status(400).json(errorResponse("bad_request", parsed.error));
    return;
  }

  const event = await EventModel.create(parsed.data);
  res.status(201).json(event.toObject());
});

/** @openapi
 * /api/events/{id}/status:
 *   patch:
 *     operationId: patchEventStatus
 *     tags: [events]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/UpdateEventStatusRequest" }
 */
eventsRouter.patch("/:id/status", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json(errorResponse("invalid_event_id", "Invalid event ID"));
    return;
  }

  const parsed = parseStatusInput(req.body ?? {});
  if (!parsed.ok) {
    res.status(400).json(errorResponse("bad_request", parsed.error));
    return;
  }

  const event = await EventModel.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!event) {
    res.status(404).json(errorResponse("event_not_found", "Event not found"));
    return;
  }

  res.json(event);
});

/** @openapi
 * /api/events/{id}:
 *   delete:
 *     operationId: deleteEvent
 *     tags: [events]
 *     parameters: [{ in: path, name: id, required: true, schema: { type: string } }]
 */
eventsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json(errorResponse("invalid_event_id", "Invalid event ID"));
    return;
  }

  const event = await EventModel.findByIdAndDelete(id).lean();
  if (!event) {
    res.status(404).json(errorResponse("event_not_found", "Event not found"));
    return;
  }

  res.status(204).send();
});
