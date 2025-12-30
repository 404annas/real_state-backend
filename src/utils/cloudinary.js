import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier"; // You might need to run: npm install streamifier

export const uploadOnCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        if (!file || (!file.buffer && !file.path)) return resolve(null);

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Use upload_stream for Buffers (Multer memoryStorage)
        let cld_upload_stream = cloudinary.uploader.upload_stream(
            { folder: "real-estate", resource_type: "auto" },
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );

        if (file.buffer) {
            streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
        } else {
            // Fallback for local path if used
            cloudinary.uploader.upload(file.path, { resource_type: "auto" }).then(resolve).catch(reject);
        }
    });
};