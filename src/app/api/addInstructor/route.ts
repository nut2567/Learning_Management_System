
import { connectMongoDB } from '@lib/mongodb';
import {User} from '@models/schema';
import mongoose from 'mongoose';
import { NextResponse,NextRequest } from 'next/server';

if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}

  export async function POST(req: NextRequest) {
      
    const {
      Instructor_Name ,
      age ,
      email ,
      image,
      phone,
    } = await req.json();
    // ตรวจสอบว่ามีสินค้าชื่อนี้อยู่แล้วหรือไม่
  const time = new Date();
    const existingPost = await User.findOne({ Instructor_Name });
    if (existingPost) {
        // ถ้าชื่อสินค้าซ้ำ ให้ส่งข้อความแจ้งเตือนกลับไป
    return NextResponse.json({message:"มีชื่อผู้สอนนี้อยู่แล้ว กรุณาใช้ชื่ออื่น",time},{status: 200})
    }
   await User.create({
    Instructor_Name ,
    age ,
    email ,
    image,
    phone,
  })
   
    return NextResponse.json({message:"Success add user",time},{status: 200})
  }

  
