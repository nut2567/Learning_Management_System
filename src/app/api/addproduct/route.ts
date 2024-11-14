
import { connectMongoDB } from '@lib/mongodb';
import Post from '@models/schema';
import mongoose from 'mongoose';
import { NextResponse,NextRequest } from 'next/server';

if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}

  export async function POST(req: NextRequest) {
    
    const {
      name,
      image,
      points,
      expiryDate,
      description,
    } = await req.json();
    // ตรวจสอบว่ามีสินค้าชื่อนี้อยู่แล้วหรือไม่
  const time = new Date();
    const existingPost = await Post.findOne({ name });
    if (existingPost) {
        // ถ้าชื่อสินค้าซ้ำ ให้ส่งข้อความแจ้งเตือนกลับไป
    return NextResponse.json({message:"สินค้าชื่อนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",time},{status: 200})
    }
   await Post.create({name, image, points, expiryDate, description})
   
    return NextResponse.json({message:"Success add product",time},{status: 200})
  }
