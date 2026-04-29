import { connectMongoDB } from "@lib/mongodb";
import Courses from "@models/schema";
import { NextResponse, NextRequest } from "next/server";

export async function DELETE(req: NextRequest) {
  await connectMongoDB();

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return new NextResponse("ID is required", { status: 400 });
  }

  try {
    await Courses.findByIdAndDelete(id);
    const time = new Date();
    return NextResponse.json({ message: "Success delete product", time }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return new NextResponse("Failed to delete product", { status: 500 });
  }
}
