import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import authRouter from "./routes/auth.routes.js"
import productRouter from "./routes/product.routes.js"
import cartRouter from "./routes/cart.routes.js"
// import cors from "cors"
import passport from "passport"
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import { config } from "./config/config.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicPath = path.join(__dirname, "../public")

const app = express()

// Trust reverse proxy (Render, Heroku, Cloudflare, etc.) to ensure req.protocol is "https"
app.set("trust proxy", 1)

app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static(publicPath))
// app.use(cors({
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true
// }))

app.use(passport.initialize())

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL,
    proxy: true
},(accessToken, refreshToken, profile, done)=>{
    return done(null, profile)
}))

app.get("/api/health", (req,res)=>{
    res.status(200).json({
        message:"Server is running"
    })
})

app.use("/api/auth", authRouter)
app.use("/api/products", productRouter)
app.use("/api/cart", cartRouter)

// 404 handler for unhandled API requests
app.use("/api", (req, res) => {
    res.status(404).json({
        message: "API endpoint not found",
        success: false
    })
})

// Catch-all fallback to serve React SPA index.html for all client-side routes
app.use((req, res) => {
    res.sendFile(path.join(publicPath, "index.html"))
})

export default app
