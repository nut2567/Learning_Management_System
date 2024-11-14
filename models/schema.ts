import mongoose, { Schema } from "mongoose";

const useSchema = new Schema({
    Course_Title: String,
    Instructor_Name: String,
    Course_Duration: Number,
    Level : String,
    Enrollment_Count: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }, Status: String,
    image: String,
});
const Courses =   mongoose.models.Courses || mongoose.model("Courses", useSchema);
export default Courses;