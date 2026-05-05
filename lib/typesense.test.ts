import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CourseSearchDocument } from "./typesense";
import {
  deleteCourseFromTypesense,
  ensureCoursesCollection,
  getCourseAutocompleteSuggestions,
  importCoursesToTypesense,
  searchCoursesInTypesense,
} from "./typesense";

const document: CourseSearchDocument = {
  id: "course-1",
  courseTitle: "React Fundamentals",
  courseTitleTh: "React Thai",
  courseDuration: 1.5,
  level: "Beginner",
  enrollmentCount: 1234,
  status: "Open",
  image: "/course.png",
  instructorId: "instructor-1",
  instructorName: "Ada Lovelace",
  instructorEmail: "ada@example.com",
  instructorImage: "/ada.png",
  instructorPhone: "123456789",
  createdAt: new Date("2024-01-01T00:00:00.000Z").getTime(),
};

const mockFetch = vi.fn();

describe("typesense", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ensures a collection exists without recreating it", async () => {
    mockFetch.mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await ensureCoursesCollection();

    expect(mockFetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8108/collections/courses",
      {
        headers: {
          "X-TYPESENSE-API-KEY": "xyz",
        },
      }
    );
  });

  it("creates the collection when Typesense returns not found", async () => {
    mockFetch
      .mockResolvedValueOnce(new Response("not found", { status: 404 }))
      .mockResolvedValueOnce(new Response("{}", { status: 201 }));

    await ensureCoursesCollection();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenLastCalledWith(
      "http://127.0.0.1:8108/collections",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns early when importing an empty document list", async () => {
    await expect(importCoursesToTypesense([])).resolves.toEqual({
      imported: 0,
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("imports documents and counts successful lines", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('{"success":true}\n{"success":true}\n', { status: 200 })
    );

    await expect(
      importCoursesToTypesense([document, { ...document, id: "course-2" }])
    ).resolves.toEqual({ imported: 2 });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8108/collections/courses/documents/import?action=upsert",
      expect.objectContaining({
        body: expect.stringContaining('"id":"course-1"'),
        method: "POST",
      })
    );
  });

  it("throws when a Typesense import line fails", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response('{"success":false,"error":"bad row"}\n', { status: 200 })
    );

    await expect(importCoursesToTypesense([document])).rejects.toThrow(
      "Typesense import failed: bad row"
    );
  });

  it("returns deleted false for a missing document", async () => {
    mockFetch.mockResolvedValueOnce(new Response("not found", { status: 404 }));

    await expect(deleteCourseFromTypesense("course-1")).resolves.toEqual({
      deleted: false,
    });
  });

  it("returns no autocomplete suggestions for blank queries", async () => {
    await expect(
      getCourseAutocompleteSuggestions({
        query: "   ",
        limit: 6,
        filters: {},
      })
    ).resolves.toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("maps autocomplete suggestions from search hits", async () => {
    mockFetch.mockResolvedValueOnce(
      Response.json({ found: 1, hits: [{ document }] })
    );

    await expect(
      getCourseAutocompleteSuggestions({
        query: "react",
        limit: 6,
        filters: { Instructor: "instructor-1", Status: "Open" },
      })
    ).resolves.toEqual([
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
    ]);

    const requestedUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(requestedUrl.searchParams.get("filter_by")).toBe(
      "instructorId:=`instructor-1` && status:=`Open`"
    );
  });

  it("maps search results into course products", async () => {
    mockFetch.mockResolvedValueOnce(
      Response.json({ found: 1, hits: [{ document }] })
    );

    await expect(
      searchCoursesInTypesense({
        query: "react",
        page: 2,
        limit: 9,
        filters: {
          Instructor: "instructor-1",
          Status: "Open",
          Level: "Beginner",
          Sort: "durationHigh",
        },
      })
    ).resolves.toEqual({
      total: 1,
      product: [
        {
          _id: "course-1",
          Course_Title: "React Fundamentals",
          Course_Title_TH: "React Thai",
          Course_Duration: 1.5,
          Level: "Beginner",
          Enrollment_Count: 1234,
          createdAt: "2024-01-01T00:00:00.000Z",
          Status: "Open",
          image: "/course.png",
          userId: {
            _id: "instructor-1",
            Instructor_Name: "Ada Lovelace",
            email: "ada@example.com",
            image: "/ada.png",
            phone: "123456789",
          },
        },
      ],
    });

    const requestedUrl = new URL(mockFetch.mock.calls[0][0]);
    expect(requestedUrl.searchParams.get("sort_by")).toBe(
      "courseDuration:desc"
    );
  });
});
