import { afterEach, vi } from "vitest";
import { fakeAppModule, resetFakeApps } from "./mocks/fakeApp";
import { fakeAuth, fakeAuthModule } from "./mocks/fakeAuth";
import { fakeFirestoreModule, fakeStore } from "./mocks/fakeFirestore";
import { fakeStorageModule } from "./mocks/fakeStorage";

// Intercepts every import of these firebase-admin submodules (including
// the one inside src/server/config/firebase.ts) with the in-memory
// doubles, so the route handlers run against fake data rather than a real
// Firebase project.
vi.mock("firebase-admin/app", () => fakeAppModule);
vi.mock("firebase-admin/auth", () => fakeAuthModule);
vi.mock("firebase-admin/firestore", () => fakeFirestoreModule);
vi.mock("firebase-admin/storage", () => fakeStorageModule);

afterEach(() => {
  fakeStore.reset();
  fakeAuth.reset();
  resetFakeApps();
});
