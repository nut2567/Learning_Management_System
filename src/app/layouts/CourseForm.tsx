"use client";

import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Toast from "../components/Toast";
import GetInstructors from "@/app/utils/getInstructors";
import type { User } from "@/app/components/FilterBar";

type CourseFormState = {
  Course_Title: string;
  userId: string;
  Course_Duration: number;
  Level: string;
  Enrollment_Count: number;
  Status: string;
  image: string;
};

const EMPTY_COURSE: CourseFormState = {
  Course_Title: "",
  userId: "",
  Course_Duration: 0,
  Level: "",
  Enrollment_Count: 0,
  Status: "",
  image: "",
};

const COURSE_FIELDS = [
  "Course_Title",
  "Course_Duration",
  "Enrollment_Count",
  "image",
] as const;

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"] as const;
const STATUS_OPTIONS = ["Open", "Closed"] as const;

const isValidImagePath = (url: string) => {
  const cleanUrl = url.split("?").at(0) ?? "";
  const hasImageExtension = /\.(jpeg|jpg|gif|png|bmp|webp)$/i.test(cleanUrl);

  return (
    hasImageExtension &&
    (url.startsWith("/") ||
      url.startsWith("http://") ||
      url.startsWith("https://"))
  );
};

export default function CourseForm() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const [courseData, setCourseData] = useState<CourseFormState>(EMPTY_COURSE);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [valid, setValid] = useState(true);
  const [erMessage, setErMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      try {
        const instructorList = await GetInstructors();
        setInstructors(instructorList);

        if (courseId) {
          const response = await axios.get(`/api/course/${courseId}`);
          const data = response.data.course;

          setCourseData({
            Course_Title: data.Course_Title ?? "",
            userId: data.userId?.toString() ?? "",
            Course_Duration: Number(data.Course_Duration ?? 0),
            Level: data.Level ?? "",
            Enrollment_Count: Number(data.Enrollment_Count ?? 0),
            Status: data.Status ?? "",
            image: data.image ?? "",
          });
        }
      } catch (error) {
        setErrorState(error instanceof Error ? error.message : "Load failed");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [courseId]);

  const setErrorState = (message: string) => {
    setErMessage(message);
    setValid(false);
    setIsLoading(false);
  };

  const updateCourseField = (
    field: keyof CourseFormState,
    value: string | number
  ) => {
    setCourseData((currentCourseData) => ({
      ...currentCourseData,
      [field]: value,
    }));
  };

  const formSubmitCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const { Course_Title, image, Level, Course_Duration, Status, userId } =
      courseData;

    if (
      !Course_Title ||
      !Level ||
      !Status ||
      !image ||
      !Course_Duration ||
      !userId
    ) {
      setErrorState("Please fill all fields correctly.");
      return;
    }

    if (!isValidImagePath(image)) {
      setErrorState("Image must be a local or remote image path.");
      return;
    }

    try {
      const endpoint = courseId ? `/api/course/${courseId}` : "/api/course";
      await axios.post(endpoint, courseData);
      setErrorState("");
      setIsModalOpen(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorState(error.response?.data?.message ?? "Submit failed");
        return;
      }

      setErrorState("Submit failed");
    }
  };

  const afterSaveSuccess = () => {
    router.refresh();
    router.push("/manage");
  };

  return (
    <div className="w-full px-10">
      {isLoading && (
        <dialog id="loading_modal" className="modal modal-open">
          <div className="modal-box text-center">
            <h3 className="font-bold text-[30px] text-white mb-10 items-end flex">
              Loading
              <span className="loading loading-dots loading-md"></span>
            </h3>
            <span className="loading loading-spinner w-24 text-info"></span>
          </div>
        </dialog>
      )}

      {isModalOpen && (
        <dialog open className="modal text-white">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Saved</h3>
            <p className="py-4">
              {courseId ? "Course updated successfully." : "Course created successfully."}
            </p>
            <div className="modal-action">
              <button className="btn" onClick={afterSaveSuccess} type="button">
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      <p className="my-6 text-left text-5xl">
        {courseId ? "Edit Course" : "Create Course"}
      </p>

      <div className="card bg-base-100 xl:w-3/5 sm:w-full shadow-xl">
        <form onSubmit={formSubmitCourse}>
          <div className="card-body gap-4 flex flex-nowrap">
            <div className="xl:flex gap-3">
              <label htmlFor="input-userId" className="w-1/5">
                Instructor
              </label>
              <select
                className="border-2 p-2 w-full rounded border-gray-300"
                id="input-userId"
                onChange={(event) => updateCourseField("userId", event.target.value)}
                value={courseData.userId}
              >
                <option value="">Select instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.Instructor_Name}
                  </option>
                ))}
              </select>
            </div>

            {COURSE_FIELDS.map((field) => (
              <div key={field} className="xl:flex gap-3">
                <label htmlFor={`input-${field}`} className="w-1/5">
                  {field}
                </label>
                <input
                  className={`border-2 p-2 w-full rounded ${
                    !valid && !courseData[field]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  id={`input-${field}`}
                  onChange={(event) =>
                    updateCourseField(
                      field,
                      field === "Course_Duration" ||
                        field === "Enrollment_Count"
                        ? Number(event.target.value)
                        : event.target.value
                    )
                  }
                  placeholder={field}
                  type={
                    field === "Course_Duration" || field === "Enrollment_Count"
                      ? "number"
                      : "text"
                  }
                  value={courseData[field]}
                />
              </div>
            ))}

            <div className="xl:flex gap-3">
              <label htmlFor="input-Level" className="w-1/5">
                Level
              </label>
              <select
                className="border-2 p-2 w-full rounded border-gray-300"
                id="input-Level"
                onChange={(event) => updateCourseField("Level", event.target.value)}
                value={courseData.Level}
              >
                <option value="">Select level</option>
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:flex gap-3">
              <label htmlFor="input-Status" className="w-1/5">
                Status
              </label>
              <select
                className="border-2 p-2 w-full rounded border-gray-300"
                id="input-Status"
                onChange={(event) => updateCourseField("Status", event.target.value)}
                value={courseData.Status}
              >
                <option value="">Select status</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <Toast
              message={erMessage}
              onClose={() => setValid(true)}
              show={!valid}
            />
            <button className="btn btn-success" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
