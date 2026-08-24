import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without vitest's `globals: true`, @testing-library/react's automatic
// cleanup-between-tests never registers — without this, Modal's
// createPortal(document.body) content (and everything else) piles up
// across tests in the same file.
afterEach(() => {
  cleanup();
});
