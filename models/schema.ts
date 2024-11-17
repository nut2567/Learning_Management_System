import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    Instructor_Name: String,
    age: Number,
    email : String,
    createdAt: {
        type: Date,
        default: Date.now
    }, 
    image: String,
    phone: String,
});

const User =   mongoose.models.User || mongoose.model("User", userSchema);
export { User };

const Courses_Schema = new Schema({
    Course_Title: String,
    Course_Duration: Number,
    Level : String,
    Enrollment_Count: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }, Status: String,
    image: String,
    userId:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Courses =   mongoose.models.Courses || mongoose.model("Courses", Courses_Schema);

export default Courses;