import {users} from '../mockData';
import { connetMongoDB } from '@lib/mongodb';
import Post from '@models/schema';
import { NextResponse } from 'next/server';

import mongoose from 'mongoose';

if (mongoose.connection.readyState === 0) {
  connetMongoDB();
}
export async function GET() {
    
  const product = await Post.find({})
  const time = new Date();
   
  return NextResponse.json({message:"Success",product,time},{status: 200})
  }
