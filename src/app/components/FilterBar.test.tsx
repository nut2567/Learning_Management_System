import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import FilterBar from "./FilterBar";

const instructors = [
  {
    _id: "instructor-1",
    Instructor_Name: "Ada Lovelace",
    email: "ada@example.com",
    role: "Instructor",
  },
  {
    _id: "instructor-2",
    Instructor_Name: "Grace Hopper",
    email: "grace@example.com",
    role: "Instructor",
  },
];

describe("FilterBar", () => {
  it("renders filter options and forwards changes", async () => {
    const user = userEvent.setup();
    const setInstructor = vi.fn();
    const setLevel = vi.fn();
    const setStatus = vi.fn();
    const setSort = vi.fn();

    render(
      <FilterBar
        Instructor=""
        Level=""
        Sort="Recommended"
        Status=""
        instructors={instructors}
        setInstructor={setInstructor}
        setLevel={setLevel}
        setSort={setSort}
        setStatus={setStatus}
      />
    );

    await user.selectOptions(screen.getByLabelText("Instructor"), "instructor-2");
    await user.selectOptions(screen.getByLabelText("Level"), "Intermediate");
    await user.selectOptions(screen.getByLabelText("Status"), "Closed");
    await user.selectOptions(screen.getByLabelText("Sort by"), "countHigh");

    expect(setInstructor).toHaveBeenCalledWith("instructor-2");
    expect(setLevel).toHaveBeenCalledWith("Intermediate");
    expect(setStatus).toHaveBeenCalledWith("Closed");
    expect(setSort).toHaveBeenCalledWith("countHigh");
  });
});
