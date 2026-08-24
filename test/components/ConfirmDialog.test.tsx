import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

describe("ConfirmDialog (approval confirmation)", () => {
  it("does not call onConfirm just from opening — a click is required", () => {
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Approve this application?"
        description="Approving will activate the salon."
        confirmLabel="Approve"
      />,
    );

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Approve this application?"
        description="Approving will activate the salon."
        confirmLabel="Approve"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Approve" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose when Cancel is clicked, not onConfirm", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open
        onClose={onClose}
        onConfirm={onConfirm}
        title="Approve this application?"
        description="Approving will activate the salon."
        confirmLabel="Approve"
      />,
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("disables both buttons while isSubmitting, to prevent duplicate actions", () => {
    render(
      <ConfirmDialog
        open
        onClose={() => {}}
        onConfirm={() => {}}
        title="Approve this application?"
        description="Approving will activate the salon."
        confirmLabel="Approve"
        isSubmitting
      />,
    );

    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  it("renders nothing when closed", () => {
    render(
      <ConfirmDialog
        open={false}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Approve this application?"
        description="Approving will activate the salon."
        confirmLabel="Approve"
      />,
    );

    expect(screen.queryByText("Approve this application?")).not.toBeInTheDocument();
  });
});
