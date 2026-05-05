import { beforeEach, describe, expect, it, vi } from "vitest";

const coursesFind = vi.fn();
const userFind = vi.fn();
const ensureCoursesCollection = vi.fn();
const importCoursesToTypesense = vi.fn();
const deleteCourseFromTypesense = vi.fn();

vi.mock("@models/schema", () => ({
  default: {
    find: coursesFind,
  },
  User: {
    find: userFind,
  },
}));

vi.mock("@lib/typesense", () => ({
  deleteCourseFromTypesense,
  ensureCoursesCollection,
  importCoursesToTypesense,
}));

const createObjectId = (id: string) => ({
  toString: () => id,
});

describe("course-search-sync", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("builds a Typesense search document from course and instructor data", async () => {
    const { buildCourseSearchDocument } = await import("./course-search-sync");
    const document = buildCourseSearchDocument(
      {
        _id: createObjectId("course-1"),
        Course_Title: "React Fundamentals",
        Course_Title_TH: undefined,
        Course_Duration: 1.5,
        Level: "Beginner",
        Enrollment_Count: 25,
        Status: "Open",
        image: "/course.png",
        userId: createObjectId("instructor-1"),
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
      },
      {
        _id: createObjectId("instructor-1"),
        Instructor_Name: "Ada Lovelace",
        email: "ada@example.com",
        image: "/ada.png",
        phone: "123456789",
      }
    );

    expect(document).toEqual({
      id: "course-1",
      courseTitle: "React Fundamentals",
      courseTitleTh: "",
      courseDuration: 1.5,
      level: "Beginner",
      enrollmentCount: 25,
      status: "Open",
      image: "/course.png",
      instructorId: "instructor-1",
      instructorName: "Ada Lovelace",
      instructorEmail: "ada@example.com",
      instructorImage: "/ada.png",
      instructorPhone: "123456789",
      createdAt: new Date("2024-01-01T00:00:00.000Z").getTime(),
    });
  });

  it("uses the current time when a course has no createdAt value", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-02-01T00:00:00.000Z"));
    const { buildCourseSearchDocument } = await import("./course-search-sync");

    const document = buildCourseSearchDocument(
      {
        _id: createObjectId("course-1"),
        Course_Title: "React Fundamentals",
        Course_Duration: 1,
        Level: "Beginner",
        Enrollment_Count: 1,
        Status: "Open",
        image: "/course.png",
        userId: createObjectId("instructor-1"),
      },
      {
        _id: createObjectId("instructor-1"),
        Instructor_Name: "Ada Lovelace",
        email: "ada@example.com",
        image: "/ada.png",
        phone: "123456789",
      }
    );

    expect(document.createdAt).toBe(
      new Date("2024-02-01T00:00:00.000Z").getTime()
    );
  });

  it("loads course documents and skips courses without matching instructors", async () => {
    const course = {
      _id: createObjectId("course-1"),
      Course_Title: "React Fundamentals",
      Course_Duration: 1,
      Level: "Beginner",
      Enrollment_Count: 1,
      Status: "Open",
      image: "/course.png",
      userId: createObjectId("instructor-1"),
    };
    coursesFind.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue([course]),
    });
    userFind.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue([]),
    });
    const { getCourseSearchDocuments } = await import("./course-search-sync");

    await expect(getCourseSearchDocuments()).resolves.toEqual([]);
  });

  it("syncs one course to Typesense", async () => {
    coursesFind.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue([
        {
          _id: createObjectId("course-1"),
          Course_Title: "React Fundamentals",
          Course_Duration: 1,
          Level: "Beginner",
          Enrollment_Count: 1,
          Status: "Open",
          image: "/course.png",
          userId: createObjectId("instructor-1"),
        },
      ]),
    });
    userFind.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue([
        {
          _id: createObjectId("instructor-1"),
          Instructor_Name: "Ada Lovelace",
          email: "ada@example.com",
          image: "/ada.png",
          phone: "123456789",
        },
      ]),
    });
    importCoursesToTypesense.mockResolvedValueOnce({ imported: 1 });
    const { syncCourseToTypesense } = await import("./course-search-sync");

    await expect(syncCourseToTypesense("course-1")).resolves.toEqual({
      indexedCourses: 1,
    });
    expect(ensureCoursesCollection).toHaveBeenCalled();
    expect(importCoursesToTypesense).toHaveBeenCalledWith([
      expect.objectContaining({ id: "course-1" }),
    ]);
  });

  it("syncs all courses owned by an instructor", async () => {
    coursesFind
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([{ _id: createObjectId("course-1") }]),
        }),
      })
      .mockReturnValueOnce({
        lean: vi.fn().mockResolvedValue([]),
      });
    userFind.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValue([]),
    });
    importCoursesToTypesense.mockResolvedValueOnce({ imported: 0 });
    const { syncInstructorCoursesToTypesense } = await import(
      "./course-search-sync"
    );

    await expect(
      syncInstructorCoursesToTypesense("instructor-1")
    ).resolves.toEqual({ indexedCourses: 0 });
    expect(coursesFind).toHaveBeenNthCalledWith(1, { userId: "instructor-1" });
  });

  it("deletes a course document from Typesense", async () => {
    deleteCourseFromTypesense.mockResolvedValueOnce({ deleted: true });
    const { deleteCourseFromTypesenseIndex } = await import(
      "./course-search-sync"
    );

    await expect(deleteCourseFromTypesenseIndex("course-1")).resolves.toEqual({
      deleted: true,
    });
    expect(ensureCoursesCollection).toHaveBeenCalled();
    expect(deleteCourseFromTypesense).toHaveBeenCalledWith("course-1");
  });
});
