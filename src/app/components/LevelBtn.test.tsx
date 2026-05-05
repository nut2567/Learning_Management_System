import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BtnLevel from "./LevelBtn";

describe("BtnLevel", () => {
  it("renders beginner styling", () => {
    render(<BtnLevel Level="Beginner" />);

    expect(screen.getByRole("button", { name: "Beginner" })).toHaveClass(
      "bg-[#E0E0ED]",
      "text-gray-500"
    );
  });

  it("renders intermediate styling", () => {
    render(<BtnLevel Level="Intermediate" />);

    expect(screen.getByRole("button", { name: "Intermediate" })).toHaveClass(
      "bg-[#E3EBFF]",
      "text-blue-500"
    );
  });

  it("renders advanced styling for any other level", () => {
    render(<BtnLevel Level="Advanced" />);

    expect(screen.getByRole("button", { name: "Advanced" })).toHaveClass(
      "bg-[#4D7EFF]",
      "text-white"
    );
  });
});
