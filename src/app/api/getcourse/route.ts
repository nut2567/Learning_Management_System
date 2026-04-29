import { connectMongoDB } from "@lib/mongodb";
import { searchCoursesInTypesense } from "@lib/typesense";
import Courses from "@models/schema";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;

type CourseQuery = {
  userId?: Types.ObjectId;
  Status?: string;
  Level?: string;
};

type SortOption = Record<string, 1 | -1>;

const toPositiveInteger = (value: string | null, fallback: number) => {
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
};

const getSortOption = (sort: string): SortOption => {
  if (sort === "A-Z") {
    return { Course_Title: 1 };
  }

  if (sort === "Z-A") {
    return { Course_Title: -1 };
  }

  if (sort === "countHigh") {
    return { Enrollment_Count: -1 };
  }

  if (sort === "countLow") {
    return { Enrollment_Count: 1 };
  }

  if (sort === "durationHigh") {
    return { Course_Duration: -1 };
  }

  if (sort === "durationLow") {
    return { Course_Duration: 1 };
  }

  return {};
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = toPositiveInteger(searchParams.get("page"), DEFAULT_PAGE);
  const limit = toPositiveInteger(searchParams.get("limit"), DEFAULT_LIMIT);
  const Instructor = searchParams.get("Instructor") || "";
  const Status = searchParams.get("Status") || "";
  const Level = searchParams.get("Level") || "";
  const Sort = searchParams.get("Sort") || "";
  const Search = searchParams.get("Search")?.trim() ?? "";
  const query: CourseQuery = {};

  if (Instructor) {
    if (!Types.ObjectId.isValid(Instructor)) {
      return NextResponse.json(
        { message: "Instructor is not a valid ObjectId" },
        { status: 400 }
      );
    }

    query.userId = new Types.ObjectId(Instructor);
  }

  if (Status) {
    query.Status = Status;
  }

  if (Level) {
    query.Level = Level;
  }

  try {
    if (Search) {
      const searchResult = await searchCoursesInTypesense({
        query: Search,
        page,
        limit,
        filters: { Instructor, Status, Level, Sort },
      });

      return NextResponse.json(
        {
          message: "Success search List",
          product: searchResult.product,
          total: searchResult.total,
        },
        { status: 200 }
      );
    }

    await connectMongoDB();

    const skip = (page - 1) * limit;
    const product = await Courses.find(query)
      .sort(getSortOption(Sort))
      .collation({ locale: "en", strength: 2 })
      .skip(skip)
      .limit(limit);

    const populatedProduct = await Courses.populate(product, {
      path: "userId",
      select: "Instructor_Name email image phone",
    });
    const total = await Courses.countDocuments(query);

    return NextResponse.json(
      { message: "Success get List", product: populatedProduct, total },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch data", error },
      { status: 500 }
    );
  }
}
