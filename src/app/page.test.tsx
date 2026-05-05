import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import GetInstructors from "@/app/utils/getInstructors";
import { GetProduct } from "@/app/utils/getproduct";
import HomePage from "./page";

vi.mock("@/app/layouts/homepage", () => ({
  default: ({
    initialProducts,
    initialinstructor,
  }: {
    initialProducts: { total: number };
    initialinstructor: Array<{ Instructor_Name: string }>;
  }) => (
    <div>
      Home mock {initialProducts.total} {initialinstructor[0]?.Instructor_Name}
    </div>
  ),
}));

vi.mock("@/app/utils/getInstructors", () => ({
  default: vi.fn(),
}));

vi.mock("@/app/utils/getproduct", () => ({
  GetProduct: vi.fn(),
}));

const mockedGetProduct = vi.mocked(GetProduct);
const mockedGetInstructors = vi.mocked(GetInstructors);

describe("HomePage", () => {
  it("loads initial products and instructors for the homepage", async () => {
    mockedGetProduct.mockResolvedValueOnce({ product: [], total: 4 });
    mockedGetInstructors.mockResolvedValueOnce([
      {
        _id: "instructor-1",
        Instructor_Name: "Ada Lovelace",
        email: "ada@example.com",
        role: "Instructor",
      },
    ]);

    render(await HomePage());

    expect(screen.getByText("Home mock 4 Ada Lovelace")).toBeInTheDocument();
  });
});
