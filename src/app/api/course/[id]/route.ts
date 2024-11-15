import { NextResponse, NextRequest } from "next/server";
import mongoose from 'mongoose';
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
    return NextResponse.json({ message: "Success", time, course }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}



export async function POST(req : NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const time = new Date();
  const {
    Course_Title,
    image,
    Instructor_Name,
    Course_Duration,
    Level,
    Enrollment_Count,
    Status,
  } = await req.json();
  const existingPost = await Courses.findOne({ Course_Title });
  console.log(existingPost)
  if (existingPost&&existingPost._id.toString() !==id) {
      // ถ้าชื่อสินค้าซ้ำ ให้ส่งข้อความแจ้งเตือนกลับไป
  return NextResponse.json({message:"สินค้าชื่อนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",time},{status: 200})
  }
  await Courses.findByIdAndUpdate(id, {Status, image, Enrollment_Count, Level, 
    Course_Duration,
    Instructor_Name,Course_Title});

  return NextResponse.json({ message: "Success update product", time }, { status: 200 });
}
