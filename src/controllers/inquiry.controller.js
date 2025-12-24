import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Inquiry } from "../models/inquiry.model.js";
import { Property } from "../models/property.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const submitInquiry = asyncHandler(async (req, res) => {
    const { name, email, phone, description, propertyId } = req.body;
    if (!name || !email || !phone || !description || !propertyId) throw new ApiError(400, "Sare fields bharna zaroori hai");

    const property = await Property.findById(propertyId);
    if (!property) throw new ApiError(404, "Property nahi mili");

    const inquiry = await Inquiry.create({
        name, email, phone, description, propertyId, ownerId: property.owner
    });

    return res.status(201).json(new ApiResponse(201, inquiry, "Aapki enquiry bhej di gayi hai"));
});

export const getInquiries = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const inquiries = await Inquiry.find()
        .populate("propertyId", "title")
        .populate("ownerId", "fullName email")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const count = await Inquiry.countDocuments();

    return res.status(200).json(new ApiResponse(200, {
        inquiries,
        pagination: { total: count, pages: Math.ceil(count / limit), currentPage: page }
    }, "Success"));
});

export const getInquiryById = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id)
        .populate("propertyId", "title")
        .populate("ownerId", "fullName email");

    if (!inquiry) throw new ApiError(404, "Inquiry not found");
    return res.status(200).json(new ApiResponse(200, inquiry, "Success"));
});