"use client";

import WrapLoading from "@/app/layouts/WrapLoadind";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import CourseForm from "@/app/layouts/CourseForm";
// dynamic import สำหรับ component ที่ใช้ useSearchParams
// const CourseForm = dynamic(() => import("../../layouts/CourseForm"), {
//   ssr: false, // ปิดการ server-side rendering สำหรับ component นี้
// });
export default function MyComponent() {
  return (
    <Suspense fallback={<WrapLoading />}>
      <CourseForm />
    </Suspense>
  );
}
