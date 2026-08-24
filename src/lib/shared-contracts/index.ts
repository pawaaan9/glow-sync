/**
 * Domain contracts (roles, statuses, categories, Firestore doc/DTO shapes,
 * validation schemas) shared conceptually with glowsync-be's
 * src/shared-contracts/. glowsync-fe and glowsync-be are separate git
 * repositories with no shared build tooling between them, so this folder
 * is a literal mirror, not a symlink or package import — when these
 * contracts change, copy the updated files to the other repo's
 * src/shared-contracts/ (or src/lib/shared-contracts/) in the same commit.
 */
export * from "./roles";
export * from "./verification-status";
export * from "./salon-status";
export * from "./salon-category";
export * from "./notifications";
export * from "./audit";
export * from "./api-errors";
export * from "./collections";
export * from "./types";
export * from "./validation";
