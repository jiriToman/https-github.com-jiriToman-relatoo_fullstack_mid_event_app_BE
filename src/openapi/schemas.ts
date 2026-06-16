/**
 * @openapi
 * components:
 *   schemas:
 *     WelcomeResponse:
 *       type: object
 *       required: [message]
 *       properties:
 *         message:
 *           type: string
 *           example: Event App API
 *     ErrorResponse:
 *       type: object
 *       required: [error]
 *       properties:
 *         error:
 *           type: string
 *     EventStatus:
 *       type: string
 *       enum: [draft, published, cancelled]
 *     Event:
 *       type: object
 *       required: [_id, title, date, location, status, createdAt]
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         status:
 *           $ref: "#/components/schemas/EventStatus"
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateEventRequest:
 *       type: object
 *       required: [title, date, location, status]
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         status:
 *           $ref: "#/components/schemas/EventStatus"
 *     UpdateEventRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         location:
 *           type: string
 *         status:
 *           $ref: "#/components/schemas/EventStatus"
 */

export {};
