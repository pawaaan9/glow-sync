import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QueryStates } from "@/components/ui/QueryStates";

describe("QueryStates (loading and error states)", () => {
  it("shows a loading indicator and hides children while isLoading", () => {
    render(
      <QueryStates isLoading isError={false} isEmpty={false}>
        <div>Row content</div>
      </QueryStates>,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText("Row content")).not.toBeInTheDocument();
  });

  it("shows an error message and hides children when isError", () => {
    render(
      <QueryStates isLoading={false} isError isEmpty={false}>
        <div>Row content</div>
      </QueryStates>,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText("Row content")).not.toBeInTheDocument();
  });

  it("shows the empty message when isEmpty", () => {
    render(
      <QueryStates isLoading={false} isError={false} isEmpty emptyMessage="No results found.">
        <div>Row content</div>
      </QueryStates>,
    );

    expect(screen.getByText("No results found.")).toBeInTheDocument();
    expect(screen.queryByText("Row content")).not.toBeInTheDocument();
  });

  it("renders children once loaded, non-error, non-empty", () => {
    render(
      <QueryStates isLoading={false} isError={false} isEmpty={false}>
        <div>Row content</div>
      </QueryStates>,
    );

    expect(screen.getByText("Row content")).toBeInTheDocument();
  });
});
