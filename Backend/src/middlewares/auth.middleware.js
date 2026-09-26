import jwt from "jsonwebtoken"
import { config } from "../config/config.js"
import userModel from "../models/user.model.js"
import blacklistedTokenModel from "../models/blacklistedToken.model.js"

export const authenticateUser = async (req, res, next) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }

    try{
        const isBlacklisted = await blacklistedTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Token is blacklisted. Unauthorized."
            })
        }

        const decoded = jwt.verify(token,config.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        if(!user){
            return res.status(401).json({
                message:"Unauthorized"
            })
        }

        req.user = user
        next()
    } catch (err){
        return res.status(401).json({message:"Unauthorized"})
    }
}

export const authenticateSeller = async (req, res, next) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }

    try {
        const isBlacklisted = await blacklistedTokenModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({
                message: "Token is blacklisted. Unauthorized."
            })
        }

        const decoded = jwt.verify(token, config.JWT_SECRET)
        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }

        if (user.role !== "seller") {
            return res.status(403).json({
                message: "Forbidden"
            })
        }

        req.user = user
        next()

    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized"
        })
    }
}