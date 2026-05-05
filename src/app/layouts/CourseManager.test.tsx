import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { createCourse } from "@/test-utils/courseFactory";
import { GetProduct } from "@/app/utils/getproduct";
import CourseManager from "./CourseManager";

vi.mock("@/app/utils/getproduct", () => ({
  GetProduct: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    delete: vi.fn(),
  },
}));

const mockedGetProduct = vi.mocked(GetProduct);
const mockedAxiosDelete = vi.mocked(axios.delete);

describe("CourseManager", () => {
  it("loads and renders courses", async () => {
    mockedGetProduct.mockResolvedValueOnce({
      product: [createCourse()],
      total: 1,
    });

    render(<CourseManager />);

    expect(await screen.findByText("React Fundamentals")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /add course/i })).toHaveAttribute(
      "href",
      "/course"
    );
  });

  it("renders an empty state when no courses exist", async () => {
    mockedGetProduct.mockResolvedValueOnce({ product: [], total: 0 });

    render(<CourseManager />);

    expect(await screen.findByText("No courses found.")).toBeInTheDocument();
  });

  it("deletes a course after confirmation and reloads the list", async () => {
    const user = userEvent.setup();
    mockedGetProduct
      .mockResolvedValueOnce({ product: [createCourse()], total: 1 })
      .mockResolvedValueOnce({ product: [], total: 0 });
    mockedAxiosDelete.mockResolvedValueOnce({ data: { message: "deleted" } });

    render(<CourseManager />);

    await screen.findByText("React Fundamentals");
    await user.click(
      screen.getByRole("button", { name: "Delete React Fundamentals" })
    );
    expect(screen.getByText("Delete course")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mockedAxiosDelete).toHaveBeenCalledWith(
        "/api/deleteproduct?id=course-1"
      );
    });
    expect(mockedGetProduct).toHaveBeenCalledTimes(2);
  });
});
