"use client";

import WrapLoading from "@/app/layouts/WrapLoadind";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
// dynamic import สำหรับ component ที่ใช้ useSearchParams
const CourseForm = dynamic(() => import("./CourseForm"), {
  ssr: false, // ปิดการ server-side rendering สำหรับ component นี้
});
export default function MyComponent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");

  return (
    <Suspense fallback={<WrapLoading />}>
      <CourseForm courseId={courseId} />
    </Suspense>
  );
}
