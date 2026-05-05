import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createCourse } from "@/test-utils/courseFactory";
import GetInstructors from "@/app/utils/getInstructors";
import { GetProduct } from "@/app/utils/getproduct";
import Home from "./homepage";

vi.mock("@/app/utils/getInstructors", () => ({
  default: vi.fn(),
}));

vi.mock("@/app/utils/getproduct", async () => {
  const actual = await vi.importActual<typeof import("@/app/utils/getproduct")>(
    "@/app/utils/getproduct"
  );

  return {
    ...actual,
    GetCourseSuggestions: vi.fn(),
    GetProduct: vi.fn(),
  };
});

const mockedGetProduct = vi.mocked(GetProduct);
const mockedGetInstructors = vi.mocked(GetInstructors);

describe("Home", () => {
  it("renders initial products and result summary", () => {
    render(
      <Home
        initialProducts={{ product: [createCourse()], total: 1 }}
        initialinstructor={[
          {
            _id: "instructor-1",
            Instructor_Name: "Ada Lovelace",
            email: "ada@example.com",
            role: "Instructor",
          },
        ]}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Available Courses" })
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 1-1 of 1 courses")).toBeInTheDocument();
    expect(screen.getByText("React Fundamentals")).toBeInTheDocument();
  });

  it("reloads products when a filter changes", async () => {
    const user = userEvent.setup();
    mockedGetProduct.mockResolvedValueOnce({ product: [], total: 0 });
    mockedGetInstructors.mockResolvedValueOnce([]);

    render(
      <Home
        initialProducts={{ product: [createCourse()], total: 1 }}
        initialinstructor={[]}
      />
    );

    await user.selectOptions(screen.getByLabelText("Level"), "Advanced");

    await waitFor(() => {
      expect(mockedGetProduct).toHaveBeenCalledWith(
        1,
        9,
        expect.objectContaining({ Level: "Advanced" })
      );
    });
    expect(
      await screen.findByText("No courses match the current search and filters.")
    ).toBeInTheDocument();
  });
});
