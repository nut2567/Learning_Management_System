"use client";

import WrapLoading from "@/app/layouts/WrapLoadind";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import CourseForm from "@/app/layouts/CourseForm";
export default function MyComponent() {
  return (
    <Suspense fallback={<WrapLoading />}>
      <CourseForm />
    </Suspense>
  );
}
