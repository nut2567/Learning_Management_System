import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ManagePage from "./page";

vi.mock("@/app/layouts/CourseManager", () => ({
  default: () => <div>Course manager mock</div>,
}));

describe("ManagePage", () => {
  it("renders the course manager", () => {
    render(<ManagePage />);

    expect(screen.getByText("Course manager mock")).toBeInTheDocument();
  });
});
