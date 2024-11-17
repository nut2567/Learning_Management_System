import { connectMongoDB } from "@lib/mongodb";
import Courses from "@models/schema";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// เชื่อมต่อ MongoDB
if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // อ่านค่า Filter จาก Query Parameters
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "9");
  const Instructor = searchParams.get("Instructor") || "";
  const Status = searchParams.get("Status") || "";
  const Level = searchParams.get("Level") || "";
  const Sort = searchParams.get("Sort") || "";

  // Query Object สำหรับ MongoDB
  const query: any = {};

  if (Instructor) {
    query.Instructor_Name = { $regex: new RegExp(Instructor, "i") }; // ใช้ regex เพื่อค้นหาชื่อ Instructor
  }

  if (Status) {
    query.Status = Status;
  }

  if (Level) {
    query.Level = Level;
  }

  // ตัวเลือกการเรียงลำดับ
  let sortOption = {};
  let product;

  if (Sort === "A-Z") {
    sortOption = { Course_Title: 1 }; // เรียงตามชื่อ (A-Z)
  } else if (Sort === "Z-A") {
    sortOption = { Course_Title: -1 }; // เรียงตามชื่อ (Z-A)
  } else if (Sort === "countHigh") {
    sortOption = { Enrollment_Count: -1 }; // เรียงตามจำนวนผู้สมัคร (มากไปน้อย)
  } else if (Sort === "countLow") {
    sortOption = { Enrollment_Count: 1 }; // เรียงตามจำนวนผู้สมัคร (น้อยไปมาก)
  } else if (Sort === "durationHigh") {
    sortOption = { Course_Duration: -1 }; // เรียงตามจำนวนเข้าเรียน (มากไปน้อย)
  } else if (Sort === "durationLow") {
    sortOption = { Course_Duration: 1 }; // เรียงตามจำนวนเข้าเรียน (น้อยไปมาก)
  } else {
    // sortOption = { createdAt: 1 }; // เรียงตามวันที่สร้าง (เก่าสุด)
    sortOption = "random"
  }

  try {
    // คำนวณ skip สำหรับการ paginate
    const skip = (page - 1) * limit;

    // ดึงข้อมูลจาก MongoDB พร้อม Populate ข้อมูลผู้ใช้

    if (sortOption === "random") {
      // ใช้ aggregate และ $sample เพื่อสุ่มข้อมูล
      product = await Courses.aggregate([
        { $match: query },  // ใช้เงื่อนไขการค้นหา (query)
        { $sample: { size: limit } } // ใช้ $sample เพื่อสุ่มข้อมูล
      ]);
    } else {
      product = await Courses.find(query)
        .sort(sortOption)
        .collation({ locale: "en", strength: 2 })
        .skip(skip)
        .limit(limit);
    }

    // ใช้ populate หลังจากดึงข้อมูล
    product = await Courses.populate(product, {
      path: 'userId',
      select: 'Instructor_Name email image phone'
    });

    // นับจำนวนทั้งหมดสำหรับคำนวณ Total Pages
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
