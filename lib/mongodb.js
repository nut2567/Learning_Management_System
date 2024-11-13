import mongoose  from "mongoose";

export async function connetMongoDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");
        
    } catch (error) {
        console.log("Error connect mongoDB",error);        
    }

}