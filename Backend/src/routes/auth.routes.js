import { Router } from "express";
import {
    validateRegisterUser,
    validateLoginUser,
} from "../validator/auth.validator.js";
import {
    register,
    login,
    googleCallback,
    logout,
    getMe,
    becomeSeller,
} from "../controllers/auth.controller.js";
import passport from "passport";
import { config } from "../config/config.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import blacklistedTokenModel from "../models/blacklistedToken.model.js";

const router = Router();

router.post("/register", validateRegisterUser, register);

router.post("/login", validateLoginUser, login);

router.get(
    "/google",
    async (req, res, next) => {
        try {
            const token = req.cookies?.token || req.headers?.authorization?.split(" ")[1];
            if (token) {
                const isBlacklisted = await blacklistedTokenModel.findOne({ token });
                if (isBlacklisted) {
                    return res.redirect("http://localhost:5173/login?error=blacklisted");
                }
            }
            next();
        } catch (e) {
            next();
        }
    },
    passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: config.NODE_ENV === "development" ? "http://localhost:5173/login" : "/login" }),
    googleCallback,
);

router.post("/logout", logout);
router.get("/logout", logout);

router.get("/me", authenticateUser, getMe);

router.patch("/become-seller", authenticateUser, becomeSeller);

export default router;
