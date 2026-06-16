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
 *       required: [error, description]
 *       properties:
 *         error:
 *           type: string
 *           description: Machine-readable error code
 *         description:
 *           type: string
 *           description: Human-readable error message
 *     EventStatus:
 *       type: string
 *       enum: [draft, published, cancelled]
 *     Event:
 *       type: object
 *       required: [_id, title, date, status, createdAt]
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
 *       required: [title, date]
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
 *     UpdateEventStatusRequest:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           $ref: "#/components/schemas/EventStatus"
 *   responses:
 *     BadRequest:
 *       description: Invalid request parameters or body
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/ErrorResponse" }
 *     NotFound:
 *       description: Requested resource was not found
 *       content:
 *         application/json:
 *           schema: { $ref: "#/components/schemas/ErrorResponse" }
 */

export {};
