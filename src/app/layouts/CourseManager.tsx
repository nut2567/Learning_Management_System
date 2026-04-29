"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { Courses } from "@/app/components/ProductList";
import WrapLoading from "@/app/layouts/WrapLoadind";
import { GetProduct } from "@/app/utils/getproduct";

const MANAGE_LIMIT = 100;

export default function CourseManager() {
  const [courses, setCourses] = useState<Courses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDeleteCourse, setPendingDeleteCourse] =
    useState<Courses | null>(null);

  const loadCourses = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await GetProduct(1, MANAGE_LIMIT);
      setCourses(response.product);
    } catch {
      setError("Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const deleteCourse = async () => {
    if (!pendingDeleteCourse) {
      return;
    }

    setIsLoading(true);

    try {
      await axios.delete(`/api/deleteproduct?id=${pendingDeleteCourse._id}`);
      setPendingDeleteCourse(null);
      await loadCourses();
    } catch {
      setError("Failed to delete course.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10 text-gray-700 sm:px-12 lg:px-24">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Manage Courses</h1>
          <p className="mt-2 text-sm text-gray-600">
            Changes are saved to MongoDB and synced to Typesense search.
          </p>
        </div>
        <Link className="btn btn-success w-fit" href="/course">
          <Plus className="h-4 w-4" />
          Add course
        </Link>
      </div>

      {error ? <p className="mb-4 text-red-600">{error}</p> : null}

      {isLoading ? (
        <WrapLoading />
      ) : (
        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Course</th>
                <th scope="col">Instructor</th>
                <th scope="col">Level</th>
                <th scope="col">Status</th>
                <th scope="col">Enrollment</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.Course_Title}</td>
                  <td>{course.userId.Instructor_Name}</td>
                  <td>{course.Level}</td>
                  <td>{course.Status}</td>
                  <td>{course.Enrollment_Count.toLocaleString("th-TH")}</td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        aria-label={`Edit ${course.Course_Title}`}
                        className="btn btn-sm"
                        href={`/course?id=${course._id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        aria-label={`Delete ${course.Course_Title}`}
                        className="btn btn-error btn-sm"
                        onClick={() => setPendingDeleteCourse(course)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {courses.length === 0 && !isLoading ? (
        <p className="mt-8 rounded-md border bg-white p-6 text-gray-600">
          No courses found.
        </p>
      ) : null}

      {pendingDeleteCourse ? (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold">Delete course</h2>
              <button
                aria-label="Close delete dialog"
                className="btn btn-ghost btn-sm"
                onClick={() => setPendingDeleteCourse(null)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p>
              Delete <strong>{pendingDeleteCourse.Course_Title}</strong> from
              MongoDB and Typesense?
            </p>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setPendingDeleteCourse(null)}
                type="button"
              >
                Cancel
              </button>
              <button className="btn btn-error" onClick={deleteCourse} type="button">
                Delete
              </button>
            </div>
          </div>
        </dialog>
      ) : null}
    </main>
  );
}
