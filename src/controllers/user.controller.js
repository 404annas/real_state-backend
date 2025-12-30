import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/mail.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

export const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, fullName } = req.body;
    if (!email || !username || !password || !fullName) throw new ApiError(400, "All fields are required");

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) throw new ApiError(409, "User already exists");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 600000; // 10 mins

    const user = await User.create({ fullName, email, password, username, otp, otpExpiry });

    await sendEmail({
        email: user.email,
        subject: "Verification OTP",
        message: `Your OTP is: ${otp}`
    });

    return res.status(201).json(new ApiResponse(201, { userId: user._id }, "OTP sent to email."));
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpiry: { $gt: Date.now() } });
    if (!user) throw new ApiError(400, "Invalid or expired OTP");

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Verified successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");
    if (!user.isVerified) throw new ApiError(403, "Verify email first");

    const isCorrect = await user.isPasswordCorrect(password);
    if (!isCorrect) throw new ApiError(401, "Invalid credentials");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const options = { httpOnly: true, secure: true };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user, accessToken, refreshToken }, "Logged in"));
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json(new ApiResponse(200, {}, "Logged out"));
});

export const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
        .select("-password -refreshToken -otp -otpExpiry")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    const count = await User.countDocuments();

    return res.status(200).json(new ApiResponse(200, {
        users,
        pagination: { total: count, pages: Math.ceil(count / limit), currentPage: page }
    }, "Success"));
});

export const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -refreshToken -otp -otpExpiry");

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, user, "Success"));
});

export const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const { fullName, username, email, phoneNumber, whatsappNumber, agentTitle } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                username,
                email,
                phoneNumber,
                whatsappNumber,
                agentTitle
            }
        },
        { new: true }
    ).select("-password -refreshToken -otp -otpExpiry");

    if (!user) throw new ApiError(404, "User not found");

    return res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

export const updateCurrentUserAvatar = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "Avatar file is required");

    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, "User not found");

    // Pass the whole file object (which contains the buffer)
    const avatar = await uploadOnCloudinary(req.file);
    if (!avatar) throw new ApiError(400, "Avatar upload failed");

    user.avatar = avatar.url;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully"));
});