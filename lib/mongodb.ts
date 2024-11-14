import mongoose  from "mongoose";

export async function connectMongoDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined");
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

    } catch (error) {
        console.log("Error connect mongoDB", error);
    }
}
