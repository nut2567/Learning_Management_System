import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Headerbar from "./Headerbar";

describe("Headerbar", () => {
  it("renders navigation links and branding images", () => {
    render(<Headerbar />);

    expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "Manage" })).toHaveAttribute(
      "href",
      "/manage"
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about"
    );
    expect(screen.getAllByAltText("Next.js logo")).toHaveLength(2);
  });
});
