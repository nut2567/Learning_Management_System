"use client";

import WrapLoading from "@/app/layouts/WrapLoadind";
import CourseForm from "@/app/layouts/CourseForm";
import { Suspense } from "react";
export default function MyComponent() {
  return (
    <Suspense fallback={<WrapLoading />}>
      <CourseForm />
    </Suspense>
  );
}
