/**
 * Domain contracts (roles, statuses, categories, Firestore doc/DTO shapes,
 * validation schemas) shared by the browser code and the API route
 * handlers in src/app/api, which import them through src/lib/shared.
 *
 * These used to be mirrored by hand into a separate Express backend. The
 * API now lives in this project, so this folder is the single source of
 * truth and no copy needs keeping in sync.
 */
export * from "./roles";
export * from "./verification-status";
export * from "./salon-status";
export * from "./salon-category";
export * from "./booking-status";
export * from "./working-hours";
export * from "./notifications";
export * from "./audit";
export * from "./api-errors";
export * from "./collections";
export * from "./types";
export * from "./validation";
