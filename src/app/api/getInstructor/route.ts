
import { connectMongoDB } from '@lib/mongodb';
import { User } from '@models/schema';
import mongoose from 'mongoose';
import { NextResponse, NextRequest } from 'next/server';

if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}


export async function GET() {
  const time = new Date();

  let userList = await User.find()
    .sort({ Instructor_Name: 1 })
    .collation({ locale: "en", strength: 2 })
  return NextResponse.json({ message: "Success update user", time, userList }, { status: 200 });
}

