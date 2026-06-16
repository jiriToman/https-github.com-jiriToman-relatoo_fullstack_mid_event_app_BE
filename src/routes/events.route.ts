import { Router } from "express";
import mongoose from "mongoose";

import {
  EVENT_STATUSES,
  EventModel,
  type EventStatus,
} from "../models/event.model.js";

export const eventsRouter = Router();

function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

function isEventStatus(value: unknown): value is EventStatus {
  return (
    typeof value === "string" &&
    EVENT_STATUSES.includes(value as EventStatus)
  );
}

function parseEventInput(
  body: Record<string, unknown>,
  partial: boolean,
):
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string } {
  const data: Record<string, unknown> = {};

  if ("title" in body) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return { ok: false, error: "title must be a non-empty string" };
    }
    data.title = body.title.trim();
  } else if (!partial) {
    return { ok: false, error: "title is required" };
  }

  if ("description" in body) {
    if (body.description !== undefined && typeof body.description !== "string") {
      return { ok: false, error: "description must be a string" };
    }
    data.description = body.description?.trim() || undefined;
  }

  if ("date" in body) {
    const date = new Date(body.date as string);
    if (Number.isNaN(date.getTime())) {
      return { ok: false, error: "date must be a valid date" };
    }
    data.date = date;
  } else if (!partial) {
    return { ok: false, error: "date is required" };
  }

  if ("location" in body) {
    if (typeof body.location !== "string" || !body.location.trim()) {
      return { ok: false, error: "location must be a non-empty string" };
    }
    data.location = body.location.trim();
  } else if (!partial) {
    return { ok: false, error: "location is required" };
  }

  if ("status" in body) {
    if (!isEventStatus(body.status)) {
      return {
        ok: false,
        error: `status must be one of: ${EVENT_STATUSES.join(", ")}`,
      };
    }
    data.status = body.status;
  } else if (!partial) {
    return { ok: false, error: "status is required" };
  }

  return { ok: true, data };
}

/**
 * @openapi
 * /api/events:
 *   get:
 *     operationId: listEvents
 *     summary: List all events
 *     tags: [events]
 *     responses:
 *       "200":
 *         description: List of events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Event"
 */
eventsRouter.get("/", async (_req, res) => {
  const events = await EventModel.find().sort({ date: 1 }).lean();
  res.json(events);
});

/**
 * @openapi
 * /api/events/{id}:
 *   get:
 *     operationId: getEventById
 *     summary: Get event by ID
 *     tags: [events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: Event found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Event"
 *       "400":
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "404":
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
eventsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid event ID" });
    return;
  }

  const event = await EventModel.findById(id).lean();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(event);
});

/**
 * @openapi
 * /api/events:
 *   post:
 *     operationId: createEvent
 *     summary: Create a new event
 *     tags: [events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/CreateEventRequest"
 *     responses:
 *       "201":
 *         description: Event created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Event"
 *       "400":
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
eventsRouter.post("/", async (req, res) => {
  const parsed = parseEventInput(req.body ?? {}, false);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  const event = await EventModel.create(parsed.data);
  res.status(201).json(event.toObject());
});

/**
 * @openapi
 * /api/events/{id}:
 *   patch:
 *     operationId: patchEvent
 *     summary: Partially update an event
 *     tags: [events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UpdateEventRequest"
 *     responses:
 *       "200":
 *         description: Event updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Event"
 *       "400":
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "404":
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
eventsRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid event ID" });
    return;
  }

  const parsed = parseEventInput(req.body ?? {}, true);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }

  if (Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "At least one field is required" });
    return;
  }

  const event = await EventModel.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json(event);
});

/**
 * @openapi
 * /api/events/{id}:
 *   delete:
 *     operationId: deleteEvent
 *     summary: Delete an event
 *     tags: [events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "204":
 *         description: Event deleted
 *       "400":
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 *       "404":
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
eventsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    res.status(400).json({ error: "Invalid event ID" });
    return;
  }

  const event = await EventModel.findByIdAndDelete(id).lean();
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.status(204).send();
});
