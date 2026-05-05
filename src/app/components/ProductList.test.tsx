import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createCourse } from "@/test-utils/courseFactory";
import ProductList from "./ProductList";

describe("ProductList", () => {
  it("renders course cards with image, instructor, duration, and enrollment", () => {
    render(<ProductList products={[createCourse()]} />);

    const card = screen.getByText("React Fundamentals").closest(".card");

    expect(card).not.toBeNull();
    expect(screen.getByAltText("React Fundamentals")).toBeInTheDocument();
    expect(screen.getByAltText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("React Thai")).toBeInTheDocument();
    expect(screen.getByText("1 hr 30 mins")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(within(card as HTMLElement).getByRole("button", { name: "Beginner" }))
      .toBeInTheDocument();
    expect(within(card as HTMLElement).getByRole("button", { name: "Open" }))
      .toBeInTheDocument();
  });

  it("uses a fallback image alt when a course has no title", () => {
    render(<ProductList products={[createCourse({ Course_Title: "" })]} />);

    expect(screen.getByAltText("Course cover")).toBeInTheDocument();
  });
});
