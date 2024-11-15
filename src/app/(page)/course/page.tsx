"use client";

import axios from "axios";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "./Toast";
import { useSearchParams } from "next/navigation";
import WrapLoading from "@/app/layouts/WrapLoadind";

interface Courses {
  Course_Title: string;
  Instructor_Name: string;
  Course_Duration: number;
  Level: string;
  Enrollment_Count: number;
  Status: string;
  image: string;
}

export default function MyComponent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const [courseData, setCourseData] = useState<Courses>({
    Course_Title: "",
    Instructor_Name: "",
    Course_Duration: 0,
    Level: "",
    Enrollment_Count: 0,
    Status: "",
    image: "",
  });
  const [valid, setValid] = useState(true);
  const [erMessage, setErMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      axios
        .get(`/api/course/${courseId}`)
        .then((response) => {
          const data = response.data.course;
          setCourseData({
            ...data,
            Course_Duration: data.Course_Duration,
            createdAt: new Date(data.createdAt),
          });
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setErrorState(error.message);
        });
    }
  }, []);

  const setErrorState = (message: string) => {
    setErMessage(message);
    setValid(false);
    setIsLoading(false);
  };

  const checkImageValidity = (url: string): boolean => {
    const imageRegex = /\.(jpeg|jpg|gif|png|bmp|webp)$/i;
    const cleanUrl = url.split("?")[0]; // ตัด query string ออก
    return (
      imageRegex.test(cleanUrl) &&
      (url.startsWith("http://") || url.startsWith("https://"))
    );
  };

  const formSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      Course_Title,
      image,
      Level,
      Course_Duration,
      Status,
      Instructor_Name,
    } = courseData;

    if (
      !Course_Title ||
      !Level ||
      !Status ||
      !image ||
      !Course_Duration ||
      !Instructor_Name
    ) {
      setErrorState("Please fill all fields correctly!");
      return;
    }
    console.log(courseData, checkImageValidity(image));
    if (!checkImageValidity(image)) {
      setErrorState("Invalid image URL");
      return;
    }

    axios
      .post(`/api/course/${courseId || ""}`, courseData)
      .then((response) => {
        if (response.data.message === "This course title already exists") {
          setErrorState(response.data.message);
          return;
        }
        setErrorState("");
        setIsModalOpen(true);
      })
      .catch((error) => {
        console.error("Error submitting data:", error);
        setIsLoading(false);
      });
  };

  const afterSaveSuccess = () => {
    router.refresh();
    router.push("/");
  };

  return (
    <Suspense fallback={<WrapLoading />}>
      <div className="w-full px-10">
        {isLoading && (
          <dialog id="loading_modal" className="modal modal-open">
            <div className="modal-box text-center">
              <h3 className="font-bold text-[30px] text-white mb-10 items-end flex">
                กำลังโหลดข้อมูล
                <span className="loading loading-dots loading-md"></span>
              </h3>
              <span className="loading loading-spinner w-24 text-info"></span>
            </div>
          </dialog>
        )}
        {isModalOpen && (
          <dialog open className="modal text-white">
            <div className="modal-box">
              <h3 className="font-bold text-lg">แจ้งเตือน</h3>
              <p className="py-4">
                {erMessage || courseId ? "แก้ไขเรียบร้อย" : "บันทึกเรียบร้อย"}
              </p>
              <div className="modal-action">
                <button onClick={afterSaveSuccess} className="btn">
                  Close
                </button>
              </div>
            </div>
          </dialog>
        )}

        <p className="my-6 text-left text-5xl">
          {courseId ? "Edit Course" : "Create Course"}
        </p>

        {
          <div>
            <div className="card bg-base-100 xl:w-3/5 sm:w-full  shadow-xl">
              <form onSubmit={formSubmitCourse}>
                <div className="card-body gap-4 flex flex-nowrap">
                  {(
                    [
                      "Course_Title",
                      "Instructor_Name",
                      "Course_Duration",
                      "Enrollment_Count",
                      "Level",
                      "Status",
                      "image",
                    ] as const
                  ).map((field) => (
                    <div key={field} className="xl:flex gap-3">
                      <label htmlFor={`input-${field}`} className="w-1/5">
                        {`${field}`}
                      </label>
                      <input
                        id={`input-${field}`}
                        value={courseData[field] as string}
                        onChange={(e) =>
                          setCourseData({
                            ...courseData,
                            [field]: e.target.value,
                          })
                        }
                        type={
                          field === "Course_Duration" ||
                          field === "Enrollment_Count"
                            ? "number"
                            : "text"
                        }
                        placeholder={field}
                        className={`border-2 p-2 w-full rounded ${
                          !valid && !courseData[field]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                  ))}

                  <Toast
                    message={erMessage}
                    show={!valid}
                    onClose={() => setValid(true)}
                  />
                  <button type="submit" className="btn btn-success">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </Suspense>
  );
}
