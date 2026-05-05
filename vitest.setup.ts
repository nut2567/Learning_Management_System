import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, vi } from "vitest";

const mockRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
};

let mockSearchParams = new URLSearchParams();

vi.mock("next/image", () => ({
  default: ({
    alt,
    fill,
    priority,
    sizes,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
  }) => React.createElement("img", { alt, ...props }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { toString: () => string };
  }) =>
    React.createElement(
      "a",
      { href: String(href), ...props },
      children
    ),
}));

vi.mock("next/font/local", () => ({
  default: () => ({
    className: "font-class",
    variable: "font-variable",
  }),
}));

vi.mock("next/navigation", () => ({
  __mockRouter: mockRouter,
  __setSearchParams: (value = "") => {
    mockSearchParams = new URLSearchParams(value);
  },
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockSearchParams = new URLSearchParams();
});
