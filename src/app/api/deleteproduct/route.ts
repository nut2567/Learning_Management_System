import { deleteCourseFromTypesenseIndex } from "@lib/course-search-sync";
import { connectMongoDB } from "@lib/mongodb";
import Courses from "@models/schema";
import { Types } from "mongoose";
import { NextResponse, type NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  await connectMongoDB();

  const id = req.nextUrl.searchParams.get("id");

  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid course ID" }, { status: 400 });
  }

  try {
    const deletedCourse = await Courses.findByIdAndDelete(id);
    if (!deletedCourse) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const syncResult = await deleteCourseFromTypesenseIndex(id);
    const time = new Date();

    return NextResponse.json(
      { message: "Success delete product", time, syncResult },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
