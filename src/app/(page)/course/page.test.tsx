import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CoursePage from "./page";

vi.mock("@/app/layouts/CourseForm", () => ({
  default: () => <div>Course form mock</div>,
}));

vi.mock("@/app/layouts/WrapLoadind", () => ({
  default: () => <div>Loading mock</div>,
}));

describe("CoursePage", () => {
  it("renders the course form inside suspense", () => {
    render(<CoursePage />);

    expect(screen.getByText("Course form mock")).toBeInTheDocument();
  });
});
