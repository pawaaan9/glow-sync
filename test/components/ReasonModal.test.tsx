import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReasonModal } from "@/components/ui/ReasonModal";

describe("ReasonModal (rejection/suspension-reason validation)", () => {
  it("blocks submission and shows an error when the reason is empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <ReasonModal
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        title="Reject this application"
        description="Explain why."
        submitLabel="Reject"
      />,
    );

    await user.click(screen.getByRole("button", { name: /reject/i }));

    expect(await screen.findByText(/provide a reason/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submission when the reason is too short", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <ReasonModal
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        title="Reject this application"
        description="Explain why."
        submitLabel="Reject"
      />,
    );

    await user.type(screen.getByLabelText(/reason/i), "too short");
    await user.click(screen.getByRole("button", { name: /reject/i }));

    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the reason once it passes validation", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <ReasonModal
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        title="Reject this application"
        description="Explain why."
        submitLabel="Reject"
      />,
    );

    await user.type(
      screen.getByLabelText(/reason/i),
      "The business registration number could not be verified.",
    );
    await user.click(screen.getByRole("button", { name: /reject/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      "The business registration number could not be verified.",
    );
  });

  it("disables the submit button while isSubmitting", () => {
    render(
      <ReasonModal
        open
        onClose={() => {}}
        onSubmit={() => {}}
        title="Reject this application"
        description="Explain why."
        submitLabel="Reject"
        isSubmitting
      />,
    );

    expect(screen.getByRole("button", { name: /reject/i })).toBeDisabled();
  });
});
