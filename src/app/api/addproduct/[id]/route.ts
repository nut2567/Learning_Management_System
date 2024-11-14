import { NextResponse, NextRequest } from "next/server";
import mongoose from 'mongoose';
import { connectMongoDB } from '@lib/mongodb';
import Post from '@models/schema';

// เชื่อมต่อกับ MongoDB ก่อนที่จะเรียกใช้ API
if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}

export async function GET({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = await Post.findById(id);
  const time = new Date();

  return NextResponse.json({ message: "Success", time, product }, { status: 200 });
}

export async function POST(req : NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const time = new Date();
  const { name, image, points, expiryDate, description } = await req.json();
  const existingPost = await Post.findOne({ name });
  console.log(existingPost)
  if (existingPost&&existingPost._id.toString() !==id) {
      // ถ้าชื่อสินค้าซ้ำ ให้ส่งข้อความแจ้งเตือนกลับไป
  return NextResponse.json({message:"สินค้าชื่อนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น",time},{status: 200})
  }
  await Post.findByIdAndUpdate(id, { name, image, points, expiryDate, description });

  return NextResponse.json({ message: "Success update product", time }, { status: 200 });
}
