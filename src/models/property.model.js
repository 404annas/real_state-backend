import mongoose, { Schema } from "mongoose";

const propertySchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ["Night", "Month"], default: "Month" },
    type: { type: String, enum: ["Lodge", "Apartment", "Condo", "Suite", "Luxue"], required: true },
    propertyFor: { type: String, enum: ["Rent", "Buy"], required: true },

    // Status Badges (Image 1, 3, 4)
    isNew: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },

    address: {
        street: String,
        city: { type: String, index: true },
        state: String,
        country: String,
        zip: String,
        latitude: { type: Number, default: 0 },
        longitude: { type: Number, default: 0 }
    },

    // Dynamic Property Features Grid (Image 5)
    features: {
        bedrooms: { type: Number, default: 0 },
        bathrooms: { type: Number, default: 0 },
        sqft: { type: Number, default: 0 },
        floor: { type: String }, // e.g., "5th of 12"
        wardrobe: { type: Number, default: 0 },
        parking: { type: Number, default: 0 },
        balcony: { type: String, default: "No" },
        tv: { type: Number, default: 0 },
        ac: { type: Number, default: 0 },
        fridge: { type: Number, default: 0 },
        microwave: { type: Number, default: 0 },
        waterPurifier: { type: Number, default: 0 },
        curtains: { type: String, default: "No" }
    },

    // Amenities Checklist (Image 6)
    amenities: [String], // ["Gym", "Pool", "Power Backup", etc.]

    // "About Property" Checklist (Image 5)
    highlights: [String], // ["100 meters from school", "Terrace with views", etc.]

    whyBookWithUs: [String],
    nearbyLandmarks: [String],


    // Gallery and Documents (Image 7)
    images: [String], // Cloudinary URLs
    floorPlans: [{
        title: { type: String, default: "Floor Plan" },
        fileUrl: { type: String }
    }],

    // Stats & Ratings (Image 2, 4)
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    totalVisits: { type: Number, default: 0 },

    owner: { type: Schema.Types.ObjectId, ref: "User" }

}, { timestamps: true });

export const Property = mongoose.model("Property", propertySchema);