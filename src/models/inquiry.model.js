import mongoose, { Schema } from "mongoose";

const inquirySchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const Inquiry = mongoose.model("Inquiry", inquirySchema);