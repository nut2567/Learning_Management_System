import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footerbar from "./footer";

describe("Footerbar", () => {
  it("renders the project footer text", () => {
    render(<Footerbar />);

    expect(screen.getByText(/Learning Management System/)).toBeInTheDocument();
  });
});
