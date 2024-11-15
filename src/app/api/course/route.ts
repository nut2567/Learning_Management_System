
import { connectMongoDB } from '@lib/mongodb';
import Courses from '@models/schema';
import mongoose from 'mongoose';
import { NextResponse,NextRequest } from 'next/server';

if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}

  export async function POST(req: NextRequest) {
      
    const {
      Course_Title,
      image,
      Instructor_Name,
      Course_Duration,
      Level,
      Enrollment_Count,
      Status,
    } = await req.json();
    // ตรวจสอบว่ามีสินค้าชื่อนี้อยู่แล้วหรือไม่
  const time = new Date();
    const existingPost = await Courses.findOne({ Course_Title,Instructor_Name });
    if (existingPost) {
        // ถ้าชื่อสินค้าซ้ำ ให้ส่งข้อความแจ้งเตือนกลับไป
    return NextResponse.json({message:"ผู้สอนนี้มีชื่อรายการนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",time},{status: 200})
    }
   await Courses.create({Status, image, Enrollment_Count, Level, 
    Course_Duration,
    Instructor_Name,Course_Title})
   
    return NextResponse.json({message:"Success add product",time},{status: 200})
  }
