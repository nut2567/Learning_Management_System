import type { Courses } from "@/app/components/ProductList";

export const createCourse = (overrides: Partial<Courses> = {}): Courses => ({
  _id: "course-1",
  Course_Title: "React Fundamentals",
  Course_Title_TH: "React Thai",
  userId: {
    _id: "instructor-1",
    Instructor_Name: "Ada Lovelace",
    email: "ada@example.com",
    image: "/ada.png",
    phone: "123456789",
  },
  Course_Duration: 1.3,
  Level: "Beginner",
  Enrollment_Count: 1234,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  Status: "Open",
  image: "/course.png",
  ...overrides,
});
