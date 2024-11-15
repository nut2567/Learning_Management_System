
import { connectMongoDB } from '@lib/mongodb';
import Courses from '@models/schema';
import { NextResponse } from 'next/server';

import mongoose from 'mongoose';

if (mongoose.connection.readyState === 0) {
  connectMongoDB();
}
export async function GET() {
    
  const product = await Courses.find({})
  const time = new Date();
   
  return NextResponse.json({message:"Success get List",product,time},{status: 200})
  }
