import { render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Toast from "./Toast";

describe("Toast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the message and closes after three seconds", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<Toast message="Saved" onClose={onClose} show />);

    expect(screen.getByText("Saved")).toHaveClass("opacity-100");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the message when show is false", () => {
    render(<Toast message="Hidden" onClose={vi.fn()} show={false} />);

    expect(screen.getByText("Hidden")).toHaveClass("opacity-0");
  });
});
