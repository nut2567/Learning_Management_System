
import { connectMongoDB } from '@lib/mongodb';
import { User } from '@models/schema';
import { NextResponse } from 'next/server';


export async function GET() {
  await connectMongoDB();

  const time = new Date();

  const userList = await User.find()
    .sort({ Instructor_Name: 1 })
    .collation({ locale: "en", strength: 2 })
  return NextResponse.json({ message: "Success update user", time, userList }, { status: 200 });
}

