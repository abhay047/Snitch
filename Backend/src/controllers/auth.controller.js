import userModel from "../models/user.model.js";
import blacklistedTokenModel from "../models/blacklistedToken.model.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res, message) {
    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
    })

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
}

export const register = async (req, res) => {
    const { email, contact, password, fullname, isSeller } = req.body;

    try {
        const existingUser = await userModel.findOne({
            $or: [{ email }, { contact }],
        });

        if (existingUser) {
            return res
                .status(400)
                .json({
                    message: "User with this email or contact number already exists",
                });
        }
        const user = await userModel.create({ email, contact, password, fullname, role: isSeller ? "seller" : "buyer" });

        sendTokenResponse(user, res, "User registered successfully");

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    try {
        // Check if the incoming request contains a blacklisted token
        const incomingToken = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
        if (incomingToken) {
            const isBlacklisted = await blacklistedTokenModel.findOne({ token: incomingToken });
            if (isBlacklisted) {
                return res.status(403).json({
                    message: "Blacklisted token detected. Login is not allowed with a blacklisted token.",
                    success: false
                });
            }
        }

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password", success: false });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password", success: false });
        }

        await sendTokenResponse(user, res, "User logged in successfully");
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};

export const googleCallback = async (req, res) => {
    try {
        const incomingToken = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
        if (incomingToken) {
            const isBlacklisted = await blacklistedTokenModel.findOne({ token: incomingToken });
            if (isBlacklisted) {
                return res.redirect("http://localhost:5173/login?error=blacklisted");
            }
        }

        const { id, displayName, emails } = req.user;
        const email = emails[0].value;

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                email,
                fullname: displayName,
                googleId: id,
                role: "buyer"
            });
        }

        const token = jwt.sign({
            id: user._id,
        }, config.JWT_SECRET, {
            expiresIn: "7d"
        });

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: config.NODE_ENV === "production",
        });

        res.redirect("http://localhost:5173");
    } catch (error) {
        console.error("Google callback error:", error);
        res.redirect("http://localhost:5173/login?error=server_error");
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];

        if (token) {
            const alreadyBlacklisted = await blacklistedTokenModel.findOne({ token });
            if (!alreadyBlacklisted) {
                await blacklistedTokenModel.create({ token });
            }
        }

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: config.NODE_ENV === "production",
        });

        return res.status(200).json({
            message: "Logged out successfully and token blacklisted",
            success: true
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            message: "Internal server error during logout",
            success: false
        });
    }
};

export const getMe = async (req,res)=>{
    const user = req.user;

    res.status(200).json({
        message:"User fetched successfully",
        success:true,
        user:{
            id:user._id,
            email:user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
}

export const becomeSeller = async (req, res) => {
    try {
        const user = await userModel.findByIdAndUpdate(
            req.user._id,
            { role: "seller" },
            { new: true }
        );

        res.status(200).json({
            message: "Upgraded to seller successfully",
            success: true,
            user: {
                id: user._id,
                email: user.email,
                contact: user.contact,
                fullname: user.fullname,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};