import { syncCourseToTypesense } from "@lib/course-search-sync";
import { connectMongoDB } from "@lib/mongodb";
import Courses from "@models/schema";
import { Types } from "mongoose";
import { NextResponse, type NextRequest } from "next/server";

type CoursePayload = {
  Course_Title?: string;
  image?: string;
  userId?: string;
  Course_Duration?: number;
  Level?: string;
  Enrollment_Count?: number;
  Status?: string;
};

type CompleteCoursePayload = Required<CoursePayload>;

const isValidCoursePayload = (
  payload: CoursePayload
): payload is CompleteCoursePayload =>
  Boolean(
    payload.Course_Title &&
      payload.image &&
      payload.userId &&
      payload.Course_Duration &&
      payload.Level &&
      payload.Enrollment_Count !== undefined &&
      payload.Status
  );

export async function POST(req: NextRequest) {
  await connectMongoDB();

  try {
    const payload = (await req.json()) as CoursePayload;
    const time = new Date();

    if (!isValidCoursePayload(payload)) {
      return NextResponse.json(
        { message: "Course payload is incomplete", time },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(payload.userId)) {
      return NextResponse.json(
        { message: "userId is not a valid ObjectId", time },
        { status: 400 }
      );
    }

    const userObjectId = new Types.ObjectId(payload.userId);
    const existingPost = await Courses.findOne({
      Course_Title: payload.Course_Title,
      userId: userObjectId,
    });

    if (existingPost) {
      return NextResponse.json(
        { message: "This course already exists for this instructor", time },
        { status: 400 }
      );
    }

    const newCourse = await Courses.create({
      Course_Title: payload.Course_Title,
      image: payload.image,
      userId: userObjectId,
      Course_Duration: payload.Course_Duration,
      Level: payload.Level,
      Enrollment_Count: payload.Enrollment_Count,
      Status: payload.Status,
      createdAt: time,
    });
    const syncResult = await syncCourseToTypesense(newCourse._id.toString());

    return NextResponse.json(
      { message: "Success add product", time, newCourse, syncResult },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create course",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
