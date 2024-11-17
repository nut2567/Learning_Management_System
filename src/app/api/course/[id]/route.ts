import { NextResponse, NextRequest } from "next/server";
import mongoose, { Types } from 'mongoose';
import { connectMongoDB } from '@lib/mongodb';
import Courses from '@models/schema';

// เชื่อมต่อกับ MongoDB ก่อนที่จะเรียกใช้ API
if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}


export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop(); // ดึง ID จาก URL

  if (!id) {
    return NextResponse.json({ error: "ไม่พบ ID" }, { status: 400 });
  }

  try {
    const course = await Courses.findById(id);

    if (!course) {
      return NextResponse.json({ error: "ไม่พบข้อมูลคอร์ส" }, { status: 404 });
    }

    const time = new Date();
    return NextResponse.json({ message: "Success get By id", time, course }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}




export async function POST(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop(); // ดึง ID จาก URL

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "Invalid course ID" },
      { status: 400 }
    );
  }

  const time = new Date();
  const {
    Course_Title,
    image,
    userId,
    Course_Duration,
    Level,
    Enrollment_Count,
    Status,
  } = await req.json();

  // ตรวจสอบว่ามีข้อมูล Course_Title และ userId หรือไม่
  if (!Course_Title || !userId) {
    return NextResponse.json(
      { message: "Course_Title and userId are required", time },
      { status: 400 }
    );
  }
  const userObjectId = new Types.ObjectId(userId);
  // ตรวจสอบว่ามีรายการนี้อยู่แล้วหรือไม่
  const existingPost = await Courses.findOne({ Course_Title, userId: userObjectId });

  if (existingPost && existingPost._id.toString() !== id) {
    return NextResponse.json(
      { message: "ผู้สอนนี้มีชื่อรายการนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น", time },
      { status: 400 }
    );
  }

  // อัปเดตข้อมูล
  const updatedCourse = await Courses.findByIdAndUpdate(
    id,
    {
      Course_Title,
      image,
      userId: userObjectId,
      Course_Duration,
      Level,
      Enrollment_Count,
      Status,
    },
    { new: true }
  );

  if (!updatedCourse) {
    return NextResponse.json(
      { message: "Failed to update course", time },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Success update product", time, updatedCourse },
    { status: 200 }
  );
}

