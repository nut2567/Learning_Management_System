
import { connectMongoDB } from '@lib/mongodb';
import {User} from '@models/schema';
import { NextResponse,NextRequest } from 'next/server';

  export async function POST(req : NextRequest) {
    await connectMongoDB();

    const id = req.nextUrl.pathname.split("/").pop(); 
    const time = new Date();
    const {
      Instructor_Name ,
      age ,
      email ,
      image,
      phone,
    } = await req.json();
    const existingPost = await User.findOne({ Instructor_Name });
    if (existingPost&&existingPost._id.toString() !==id) {
    return NextResponse.json({message:"มีชื่อรายการผู้สอนนี้อยู่แล้ว กรุณาใช้ชื่ออื่น",time},{status: 200})
    }
    await User.findByIdAndUpdate(id, {
      Instructor_Name ,
      age ,
      email ,
      image,
      phone,
    });
  
    return NextResponse.json({ message: "Success update user", time }, { status: 200 });
  }
  
