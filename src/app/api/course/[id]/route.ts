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

const getCourseId = (req: NextRequest) => req.nextUrl.pathname.split("/").pop();

const isCompleteCoursePayload = (
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

export async function GET(req: NextRequest) {
  await connectMongoDB();

  const id = getCourseId(req);

  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
  }

  try {
    const course = await Courses.findById(id);

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const time = new Date();
    return NextResponse.json(
      { message: "Success get By id", time, course },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  await connectMongoDB();

  const id = getCourseId(req);

  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid course ID" },
      { status: 400 }
    );
  }

  const time = new Date();
  const payload = (await req.json()) as CoursePayload;

  if (!isCompleteCoursePayload(payload)) {
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

  try {
    const userObjectId = new Types.ObjectId(payload.userId);
    const existingPost = await Courses.findOne({
      Course_Title: payload.Course_Title,
      userId: userObjectId,
    });

    if (existingPost && existingPost._id.toString() !== id) {
      return NextResponse.json(
        { message: "This course already exists for this instructor", time },
        { status: 400 }
      );
    }

    const updatedCourse = await Courses.findByIdAndUpdate(
      id,
      {
        Course_Title: payload.Course_Title,
        image: payload.image,
        userId: userObjectId,
        Course_Duration: payload.Course_Duration,
        Level: payload.Level,
        Enrollment_Count: payload.Enrollment_Count,
        Status: payload.Status,
      },
      { new: true }
    );

    if (!updatedCourse) {
      return NextResponse.json(
        { message: "Course not found", time },
        { status: 404 }
      );
    }

    const syncResult = await syncCourseToTypesense(updatedCourse._id.toString());

    return NextResponse.json(
      { message: "Success update product", time, updatedCourse, syncResult },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update course",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
