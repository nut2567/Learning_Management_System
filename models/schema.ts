import mongoose, { Schema } from "mongoose";

const useSchema = new Schema({
    Course_Title: String,
    Instructor_Name: String,
    Course_Duration: Date,
    Level : String,
    Enrollment_Count: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }, Status: String,
});
const Courses =   mongoose.models.Post || mongoose.model("Courses", useSchema);
export default Courses;