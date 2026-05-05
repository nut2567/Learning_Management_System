import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "./page";

describe("AboutPage", () => {
  it("renders project overview sections", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", { name: "Learning Management System" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What this project does" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tools and technologies" })
    ).toBeInTheDocument();
  });
});
