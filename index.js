import express, { urlencoded } from "express";
import helmet from "helmet";
import cors from "cors"
import cookieParseer from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js"

const app = express();

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(cookieParseer())
app.use(urlencoded({ extended: true }))


mongoose.connect(process.env.DB_URI).then(() => {
    console.log("Database Connected....")
}).catch((err) => {
    console.log(err)
})


app.get("/", (req, res) => {
    res.json({ message: "Hello from the server" })
})


app.use("/api/auth", authRoutes);

 
app.listen(process.env.PORT, () => {
    console.log("Listening")
})