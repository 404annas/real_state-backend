import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Property } from "../models/property.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createProperty = asyncHandler(async (req, res) => {
    const { features, amenities, highlights, whyBookWithUs, nearbyLandmarks, address,
            ownerFullName, ownerUsername, ownerPhoneNumber, ownerWhatsAppNumber, ownerEmail, ownerAgentTitle, ...rest } = req.body;

    const imageFiles = req.files?.images || [];
    const floorPlanFiles = req.files?.floorPlans || [];
    const ownerAvatarFile = req.files?.ownerAvatar?.[0]; // Handle owner avatar upload

    const imageUrls = [];
    for (const file of imageFiles) {
        const uploaded = await uploadOnCloudinary(file.path);
        if (uploaded) imageUrls.push(uploaded.url);
    }

    const floorPlans = [];
    for (let i = 0; i < floorPlanFiles.length; i++) {
        const uploaded = await uploadOnCloudinary(floorPlanFiles[i].path);
        if (uploaded) {
            floorPlans.push({
                title: req.body.floorPlanTitles?.[i] || "Plan",
                fileUrl: uploaded.url
            });
        }
    }

    // Handle owner avatar upload
    let ownerAvatarUrl = null;
    if (ownerAvatarFile) {
        const avatarUploaded = await uploadOnCloudinary(ownerAvatarFile.path);
        if (avatarUploaded) {
            ownerAvatarUrl = avatarUploaded.url;
        }
    }

    // Create or find the property owner
    let owner;
    let shouldUpdateOwner = false;

    if (ownerEmail && ownerEmail.trim() !== '') {
        // Check if owner already exists
        owner = await User.findOne({ email: ownerEmail });
        if (owner) {
            // Update existing owner details with the dashboard-entered information
            if (ownerFullName && ownerFullName !== owner.fullName) {
                owner.fullName = ownerFullName;
                shouldUpdateOwner = true;
            }
            if (ownerUsername && ownerUsername !== owner.username) {
                owner.username = ownerUsername;
                shouldUpdateOwner = true;
            }
            if (ownerPhoneNumber && ownerPhoneNumber !== owner.phoneNumber) {
                owner.phoneNumber = ownerPhoneNumber;
                shouldUpdateOwner = true;
            }
            if (ownerWhatsAppNumber && ownerWhatsAppNumber !== owner.whatsappNumber) {
                owner.whatsappNumber = ownerWhatsAppNumber;
                shouldUpdateOwner = true;
            }
            if (ownerAgentTitle && ownerAgentTitle !== owner.agentTitle) {
                owner.agentTitle = ownerAgentTitle;
                shouldUpdateOwner = true;
            }
            if (ownerAvatarUrl && ownerAvatarUrl !== owner.avatar) {
                owner.avatar = ownerAvatarUrl;
                shouldUpdateOwner = true;
            }

            if (shouldUpdateOwner) {
                await owner.save();
            }
        } else {
            // Create new owner with dashboard-entered information
            owner = await User.create({
                fullName: ownerFullName,
                username: ownerUsername || `owner_${Date.now()}`,
                email: ownerEmail,
                phoneNumber: ownerPhoneNumber,
                whatsappNumber: ownerWhatsAppNumber,
                agentTitle: ownerAgentTitle || "Property Agent",
                avatar: ownerAvatarUrl,
                password: `TempPassword${Date.now()}`, // Temporary password - should be reset
                isVerified: true // Mark as verified for property owners
            });
        }
    } else {
        // Use current logged-in user as owner
        owner = req.user;
    }

    const property = await Property.create({
        ...rest,
        images: imageUrls,
        floorPlans,
        owner: owner._id,
        address: typeof address === 'string' ? JSON.parse(address) : address,
        features: typeof features === 'string' ? JSON.parse(features) : features,
        amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
        highlights: typeof highlights === 'string' ? JSON.parse(highlights) : highlights,
        whyBookWithUs: typeof whyBookWithUs === 'string' ? JSON.parse(whyBookWithUs) : whyBookWithUs,
        nearbyLandmarks: typeof nearbyLandmarks === 'string' ? JSON.parse(nearbyLandmarks) : nearbyLandmarks
    });

    // Populate the owner information in the response to ensure complete data
    const populatedProperty = await Property.findById(property._id)
        .populate("owner", "fullName avatar phoneNumber whatsappNumber agentTitle email username");

    return res.status(201).json(new ApiResponse(201, populatedProperty, "Property Created"));
});

export const updateProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { features, amenities, highlights, whyBookWithUs, nearbyLandmarks, address,
            ownerFullName, ownerUsername, ownerPhoneNumber, ownerWhatsAppNumber, ownerEmail, ownerAgentTitle, ...rest } = req.body;

    const imageFiles = req.files?.images || [];
    const floorPlanFiles = req.files?.floorPlans || [];
    const ownerAvatarFile = req.files?.ownerAvatar?.[0]; // Handle owner avatar upload

    // Find the existing property
    const existingProperty = await Property.findById(id);
    if (!existingProperty) throw new ApiError(404, "Property not found");

    // Handle image uploads
    const imageUrls = [...existingProperty.images]; // Keep existing images
    for (const file of imageFiles) {
        const uploaded = await uploadOnCloudinary(file.path);
        if (uploaded) imageUrls.push(uploaded.url);
    }

    // Handle floor plan uploads
    const floorPlans = [...existingProperty.floorPlans]; // Keep existing floor plans
    for (let i = 0; i < floorPlanFiles.length; i++) {
        const uploaded = await uploadOnCloudinary(floorPlanFiles[i].path);
        if (uploaded) {
            floorPlans.push({
                title: req.body.floorPlanTitles?.[i] || "Plan",
                fileUrl: uploaded.url
            });
        }
    }

    // Update or create the property owner
    let owner = await User.findById(existingProperty.owner);
    let shouldUpdateOwner = false;

    if (!owner) {
        // If owner doesn't exist, create a new one if ownerEmail is provided
        if (ownerEmail && ownerEmail.trim() !== '') {
            owner = await User.create({
                fullName: ownerFullName,
                username: ownerUsername || `owner_${Date.now()}`,
                email: ownerEmail,
                phoneNumber: ownerPhoneNumber,
                whatsappNumber: ownerWhatsAppNumber,
                agentTitle: ownerAgentTitle || "Property Agent",
                password: `TempPassword${Date.now()}`, // Temporary password
                isVerified: true
            });
        } else {
            // Use current logged-in user as owner
            owner = req.user;
        }
    } else {
        // Always update the existing owner details if they are provided in the request
        // This ensures that the admin-entered details are always reflected
        if (ownerFullName !== undefined && ownerFullName !== '') {
            owner.fullName = ownerFullName;
            shouldUpdateOwner = true;
        }
        if (ownerUsername !== undefined && ownerUsername !== '') {
            owner.username = ownerUsername;
            shouldUpdateOwner = true;
        }
        if (ownerPhoneNumber !== undefined && ownerPhoneNumber !== '') {
            owner.phoneNumber = ownerPhoneNumber;
            shouldUpdateOwner = true;
        }
        if (ownerWhatsAppNumber !== undefined && ownerWhatsAppNumber !== '') {
            owner.whatsappNumber = ownerWhatsAppNumber;
            shouldUpdateOwner = true;
        }
        if (ownerAgentTitle !== undefined && ownerAgentTitle !== '') {
            owner.agentTitle = ownerAgentTitle;
            shouldUpdateOwner = true;
        }
        if (ownerEmail !== undefined && ownerEmail !== '') {
            owner.email = ownerEmail;
            shouldUpdateOwner = true;
        }
    }

    // Handle owner avatar upload
    if (ownerAvatarFile) {
        const avatarUploaded = await uploadOnCloudinary(ownerAvatarFile.path);
        if (avatarUploaded) {
            owner.avatar = avatarUploaded.url;
            shouldUpdateOwner = true;
        }
    }

    if (shouldUpdateOwner) {
        await owner.save();
    }

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(
        id,
        {
            ...rest,
            images: imageUrls,
            floorPlans,
            owner: owner._id,
            address: typeof address === 'string' ? JSON.parse(address) : address,
            features: typeof features === 'string' ? JSON.parse(features) : features,
            amenities: typeof amenities === 'string' ? JSON.parse(amenities) : amenities,
            highlights: typeof highlights === 'string' ? JSON.parse(highlights) : highlights,
            whyBookWithUs: typeof whyBookWithUs === 'string' ? JSON.parse(whyBookWithUs) : whyBookWithUs,
            nearbyLandmarks: typeof nearbyLandmarks === 'string' ? JSON.parse(nearbyLandmarks) : nearbyLandmarks
        },
        { new: true }
    );

    // Populate the owner information in the response to ensure complete data
    const populatedUpdatedProperty = await Property.findById(updatedProperty._id)
        .populate("owner", "fullName avatar phoneNumber whatsappNumber agentTitle email username");

    return res.status(200).json(new ApiResponse(200, populatedUpdatedProperty, "Property Updated"));
});

export const getAllProperties = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, city, minPrice, maxPrice, propertyFor } = req.query;

    const query = {};
    if (type) query.type = type;
    if (city) query["address.city"] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (propertyFor) query.propertyFor = propertyFor; // Add propertyFor filter

    const properties = await Property.find(query)
        .populate("owner", "fullName avatar phoneNumber whatsappNumber agentTitle email username")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const count = await Property.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        properties,
        pagination: { total: count, pages: Math.ceil(count / limit), currentPage: page }
    }, "Success"));
});

export const getPropertyById = asyncHandler(async (req, res) => {
    const property = await Property.findByIdAndUpdate(req.params.id, { $inc: { totalVisits: 1 } }, { new: true })
        .populate("owner", "fullName avatar phoneNumber whatsappNumber agentTitle email username");

    if (!property) throw new ApiError(404, "Not found");
    return res.status(200).json(new ApiResponse(200, property, "Success"));
});

// Admin function to get all properties with more options
export const getAllPropertiesAdmin = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, city, minPrice, maxPrice, search, propertyFor } = req.query;

    const query = {};
    if (type) query.type = type;
    if (city) query["address.city"] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (propertyFor) query.propertyFor = propertyFor; // Add propertyFor filter
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { "address.city": { $regex: search, $options: 'i' } }
        ];
    }

    const properties = await Property.find(query)
        .populate("owner", "fullName avatar phoneNumber whatsappNumber agentTitle email username")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const count = await Property.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        properties,
        pagination: { total: count, pages: Math.ceil(count / limit), currentPage: page }
    }, "Success"));
});


export const deleteProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Find the property to delete
    const property = await Property.findById(id);
    if (!property) throw new ApiError(404, "Property not found");

    // Since only one person uses the admin panel, allow any authenticated user to delete properties
    // (The user is already authenticated via verifyJWT middleware)

    // Delete the property
    await Property.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, null, "Property deleted successfully"));
});
