import { connectMongoDB } from "@lib/mongodb";
import Courses from "@models/schema";
import { NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";

// เชื่อมต่อ MongoDB
if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "9");
  const Instructor = searchParams.get("Instructor") || "";
  const Status = searchParams.get("Status") || "";
  const Level = searchParams.get("Level") || "";
  const Sort = searchParams.get("Sort") || "";

  const query: any = {};

  if (Instructor) {
    const userObjectId = new Types.ObjectId(Instructor);
    query.userId = userObjectId;
  }

  if (Status) {
    query.Status = Status;
  }

  if (Level) {
    query.Level = Level;
  }

  let sortOption = {};
  let product;

  if (Sort === "A-Z") {
    sortOption = { Course_Title: 1 };
  } else if (Sort === "Z-A") {
    sortOption = { Course_Title: -1 };
  } else if (Sort === "countHigh") {
    sortOption = { Enrollment_Count: -1 };
  } else if (Sort === "countLow") {
    sortOption = { Enrollment_Count: 1 };
  } else if (Sort === "durationHigh") {
    sortOption = { Course_Duration: -1 };
  } else if (Sort === "durationLow") {
    sortOption = { Course_Duration: 1 };
  } else {
    sortOption = "random";
  }

  try {
    const skip = (page - 1) * limit;

    if (sortOption === "random") {
      product = await Courses.aggregate([
        { $match: query },
        { $sample: { size: limit } }
      ]);
    } else {
      product = await Courses.find(query)
        .sort(sortOption)
        .collation({ locale: "en", strength: 2 })
        .skip(skip)
        .limit(limit);
    }

    product = await Courses.populate(product, {
      path: 'userId',
      select: 'Instructor_Name email image phone'
    });

    const total = await Courses.countDocuments(query);

    return NextResponse.json(
      { message: "Success get List", product, total },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Failed to fetch data", error },
      { status: 500 }
    );
  }
}

