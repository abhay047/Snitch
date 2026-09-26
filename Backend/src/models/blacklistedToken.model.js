import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "7d", // Automatically expire documents after 7 days
    },
});

const blacklistedTokenModel = mongoose.model("blacklistedToken", blacklistedTokenSchema);

export default blacklistedTokenModel;
