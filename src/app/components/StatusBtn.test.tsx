import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BtnStatus from "./StatusBtn";

describe("BtnStatus", () => {
  it("renders open styling", () => {
    render(<BtnStatus Status="Open" />);

    expect(screen.getByRole("button", { name: "Open" })).toHaveClass(
      "bg-base",
      "text-[#42AB8B]"
    );
  });

  it("renders closed styling", () => {
    render(<BtnStatus Status="Closed" />);

    expect(screen.getByRole("button", { name: "Closed" })).toHaveClass(
      "bg-base",
      "text-gray-500"
    );
  });
});
