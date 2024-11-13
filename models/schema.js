import mongoose, { Schema } from "mongoose";

const useSchema = new Schema({
    name: String,
    description: String,
    availability: Boolean,
    expiryDate: String,
    points: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }, image: String,
});
const Post =   mongoose.models.Post || mongoose.model("Post", useSchema);
export default Post;