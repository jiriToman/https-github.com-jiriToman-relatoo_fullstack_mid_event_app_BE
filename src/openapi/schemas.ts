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
 *     HealthResponse:
 *       type: object
 *       required: [status, database, timestamp]
 *       properties:
 *         status:
 *           type: string
 *           enum: [ok]
 *         database:
 *           type: string
 *           enum: [connected, connecting, disconnected]
 *         timestamp:
 *           type: string
 *           format: date-time
 */

export {};
