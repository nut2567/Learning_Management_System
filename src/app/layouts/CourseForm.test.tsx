import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import type { User } from "@/app/components/FilterBar";
import GetInstructors from "@/app/utils/getInstructors";
import CourseForm from "./CourseForm";

vi.mock("@/app/utils/getInstructors", () => ({
  default: vi.fn(),
}));

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn((error: { isAxiosError?: boolean }) =>
      Boolean(error?.isAxiosError)
    ),
    post: vi.fn(),
  },
}));

const instructors: User[] = [
  {
    _id: "507f1f77bcf86cd799439011",
    Instructor_Name: "Ada Lovelace",
    email: "ada@example.com",
    role: "Instructor",
  },
];

const mockedGetInstructors = vi.mocked(GetInstructors);
const mockedAxiosPost = vi.mocked(axios.post);

describe("CourseForm", () => {
  it("loads instructors for the create form", async () => {
    mockedGetInstructors.mockResolvedValueOnce(instructors);

    render(<CourseForm />);

    expect(await screen.findByRole("option", { name: "Ada Lovelace" }))
      .toBeInTheDocument();
    expect(screen.getByText("Create Course")).toBeInTheDocument();
  });

  it("shows validation when required fields are missing", async () => {
    const user = userEvent.setup();
    mockedGetInstructors.mockResolvedValueOnce(instructors);

    render(<CourseForm />);

    await screen.findByRole("option", { name: "Ada Lovelace" });
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      screen.getByText("Please fill all fields correctly.")
    ).toBeInTheDocument();
    expect(mockedAxiosPost).not.toHaveBeenCalled();
  });

  it("submits a valid course and shows the success dialog", async () => {
    const user = userEvent.setup();
    mockedGetInstructors.mockResolvedValueOnce(instructors);
    mockedAxiosPost.mockResolvedValueOnce({ data: { message: "saved" } });

    render(<CourseForm />);

    await screen.findByRole("option", { name: "Ada Lovelace" });
    await user.selectOptions(screen.getByLabelText("Instructor"), instructors[0]._id);
    await user.type(screen.getByLabelText("Course title"), "React Fundamentals");
    await user.type(screen.getByLabelText("Duration"), "2");
    await user.type(screen.getByLabelText("Enrollment count"), "50");
    await user.type(screen.getByLabelText("Image"), "/course.png");
    await user.selectOptions(screen.getByLabelText("Level"), "Beginner");
    await user.selectOptions(screen.getByLabelText("Status"), "Open");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockedAxiosPost).toHaveBeenCalledWith(
        "/api/course",
        expect.objectContaining({
          Course_Title: "React Fundamentals",
          Course_Duration: 2,
          Enrollment_Count: 50,
          image: "/course.png",
          userId: instructors[0]._id,
        })
      );
    });
    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });
});
