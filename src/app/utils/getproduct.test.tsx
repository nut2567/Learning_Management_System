import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GetCourseSuggestions,
  GetProduct,
  type CourseFilters,
} from "./getproduct";
import { createCourse } from "@/test-utils/courseFactory";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedAxiosGet = vi.mocked(axios.get);

const emptyFilters: CourseFilters = {
  Instructor: "",
  Status: "",
  Level: "",
  Sort: "",
  Search: "",
};

describe("GetProduct", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it("fetches courses with only populated filter params", async () => {
    const product = [createCourse()];
    mockedAxiosGet.mockResolvedValueOnce({ data: { product, total: 1 } });

    await expect(
      GetProduct(2, 12, {
        Instructor: "instructor-1",
        Status: "Open",
        Level: "",
        Sort: "countHigh",
        Search: "react",
      })
    ).resolves.toEqual({ product, total: 1 });

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "http://localhost:4400/api/getcourse",
      {
        params: {
          page: 2,
          limit: 12,
          Instructor: "instructor-1",
          Status: "Open",
          Sort: "countHigh",
          Search: "react",
        },
      }
    );
  });

  it("uses default pagination and filters", async () => {
    mockedAxiosGet.mockResolvedValueOnce({ data: { product: [], total: 0 } });

    await GetProduct();

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "http://localhost:4400/api/getcourse",
      { params: { page: 1, limit: 9 } }
    );
  });

  it("returns the default response when product is not an array", async () => {
    mockedAxiosGet.mockResolvedValueOnce({ data: { product: null, total: 20 } });

    await expect(GetProduct()).resolves.toEqual({ product: [], total: 0 });
  });

  it("returns the default response when the request fails", async () => {
    mockedAxiosGet.mockRejectedValueOnce(new Error("network error"));

    await expect(GetProduct()).resolves.toEqual({ product: [], total: 0 });
  });
});

describe("GetCourseSuggestions", () => {
  it("does not request suggestions when search text is blank", async () => {
    await expect(
      GetCourseSuggestions({ ...emptyFilters, Search: "   " })
    ).resolves.toEqual({ suggestions: [] });

    expect(mockedAxiosGet).not.toHaveBeenCalled();
  });

  it("fetches suggestions with filters and limit", async () => {
    const suggestions = [
      {
        id: "course-1",
        title: "React Fundamentals",
        titleTh: "React Thai",
        instructorName: "Ada Lovelace",
        level: "Beginner",
        status: "Open",
        image: "/course.png",
        enrollmentCount: 1234,
      },
    ];
    mockedAxiosGet.mockResolvedValueOnce({ data: { suggestions } });

    await expect(
      GetCourseSuggestions(
        {
          Instructor: "instructor-1",
          Status: "Open",
          Level: "Beginner",
          Sort: "",
          Search: "react",
        },
        3
      )
    ).resolves.toEqual({ suggestions });

    expect(mockedAxiosGet).toHaveBeenCalledWith(
      "http://localhost:4400/api/course-autocomplete",
      {
        params: {
          page: 1,
          limit: 3,
          Instructor: "instructor-1",
          Status: "Open",
          Level: "Beginner",
          Search: "react",
        },
      }
    );
  });

  it("returns the default response when suggestions are invalid", async () => {
    mockedAxiosGet.mockResolvedValueOnce({ data: { suggestions: null } });

    await expect(
      GetCourseSuggestions({ ...emptyFilters, Search: "react" })
    ).resolves.toEqual({ suggestions: [] });
  });
});
