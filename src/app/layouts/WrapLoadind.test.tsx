import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WrapLoading from "./WrapLoadind";

describe("WrapLoading", () => {
  it("renders the loading skeleton grid", () => {
    const { container } = render(<WrapLoading />);

    expect(container.querySelector(".loading-dots")).toBeInTheDocument();
    expect(container.querySelectorAll(".customskeleton")).toHaveLength(27);
  });
});
