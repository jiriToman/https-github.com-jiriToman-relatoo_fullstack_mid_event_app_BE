import { Router } from "express";
import { EventModel } from "../models/event.model.js";
import {
  isValidObjectId,
  parseCreateEventInput,
  parseEventFilters,
  parseStatusInput,
} from "./events.validation.js";

export const eventsRouter = Router();

function errorResponse(error: string, description: string) {
  return { error, description };
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

  const events = await EventModel.find(parsed.data).sort({ date: 1 }).lean();
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
