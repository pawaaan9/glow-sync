import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { RequireRole } from "@/components/auth/RequireRole";
import { ROLES } from "@/lib/shared";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const useAuthMock = vi.fn();
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => useAuthMock(),
}));

describe("RequireRole (role-based route protection)", () => {
  beforeEach(() => {
    replace.mockClear();
    useAuthMock.mockReset();
  });

  it("shows a loader and does not render children while auth is resolving", () => {
    useAuthMock.mockReturnValue({
      firebaseUser: undefined,
      me: undefined,
      isLoading: true,
      isError: false,
    });

    render(
      <RequireRole roles={[ROLES.PLATFORM_ADMIN]}>
        <div>Secret content</div>
      </RequireRole>,
    );

    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /login when signed out", async () => {
    useAuthMock.mockReturnValue({
      firebaseUser: null,
      me: undefined,
      isLoading: false,
      isError: false,
    });

    render(
      <RequireRole roles={[ROLES.PLATFORM_ADMIN]}>
        <div>Secret content</div>
      </RequireRole>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("redirects away when signed in but the role doesn't match", async () => {
    useAuthMock.mockReturnValue({
      firebaseUser: { uid: "u1" },
      me: { user: { role: ROLES.CUSTOMER }, salon: null },
      isLoading: false,
      isError: false,
    });

    render(
      <RequireRole roles={[ROLES.PLATFORM_ADMIN]}>
        <div>Secret content</div>
      </RequireRole>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders children once signed in with an authorized role", () => {
    useAuthMock.mockReturnValue({
      firebaseUser: { uid: "u1" },
      me: { user: { role: ROLES.PLATFORM_ADMIN }, salon: null },
      isLoading: false,
      isError: false,
    });

    render(
      <RequireRole roles={[ROLES.PLATFORM_ADMIN]}>
        <div>Secret content</div>
      </RequireRole>,
    );

    expect(screen.getByText("Secret content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
