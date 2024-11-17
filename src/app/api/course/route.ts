import { connectMongoDB } from '@lib/mongodb';
import Courses from '@models/schema';
import mongoose, { Types } from 'mongoose';
import { NextResponse, NextRequest } from 'next/server';

if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}

export async function POST(req: NextRequest) {
  try {
    const {
      Course_Title,
      image,
      userId,
      Course_Duration,
      Level,
      Enrollment_Count,
      Status,
    } = await req.json();
    const time = new Date();

    // ตรวจสอบว่าค่าของ userId ถูกต้องและแปลงเป็น ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "userId is not a valid ObjectId", time },
        { status: 400 }
      );
    }

    const userObjectId = new Types.ObjectId(userId);
    console.log(userObjectId, userId)


    // ตรวจสอบว่ามี Course_Title สำหรับ userId นี้อยู่แล้วหรือไม่
    const existingPost = await Courses.findOne({
      Course_Title,
      userId: userObjectId
    });

    if (existingPost) {
      return NextResponse.json(
        { message: "ผู้สอนนี้มีชื่อรายการนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น", time },
        { status: 400 }
      );
    }

    // สร้างรายการใหม่
    const newCourse = await Courses.create({
      Course_Title,
      image,
      userId: userObjectId,
      Course_Duration,
      Level,
      Enrollment_Count,
      Status,
      createdAt: time,
    });

    return NextResponse.json(
      { message: "Success add product", time, newCourse },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { message: "Failed to create course", error },
      { status: 500 }
    );
  }
}
