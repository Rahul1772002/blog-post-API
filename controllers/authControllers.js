import { signupSchema, loginSchema} from "../middlewares/validator.js"
import User from "../models/userModel.js"
import { doHash, validateUser } from "../utils/hashing.js";
import jwt from "jsonwebtoken"

export async function signup(req, res) {
    const { email, password } = req.body
    try {
        const { error, value } = signupSchema.validate({ email, password });

        if (error) {
            return res.status(401).json({success:false, message:error.details[0].message })
        }

        const existingUser = await User.findOne({ email: email })
        if (existingUser) {
            res.status(401).json({ message: "User already exists" })
        }
        else {
            const hashedPassword = await doHash(password, 12)
            
            const newUser = new User({ email, password: hashedPassword })
            const result = await newUser.save()
            result.password = undefined; 
            res.status(201).json({success:true, message:"Your account has been created succesfully.....", result})
        }
    } catch(error) {
        console.log(error)
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body

        const { error, value } = await loginSchema.validate({ email, password })
        if (error) {
            res.status(401).json({ success: false, message: error.details[0].message })
        }
        
        const existingUser = await User.findOne({ email: email }).select("+password")

        if (!existingUser) {
            res.status(401).json({ success: false, message: "User does not exist ..." })
        }

        const validateUserResult = await validateUser(password, existingUser.password)

        if (!validateUserResult) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified
        }, process.env.TOKEN_SECRET, {expires:'1h'})

        res.cookie('Authorization', 'Bearer' + token, { expires: new Date(Date.now() + 1 * 3600000), httpOnly: process.env.NODE_ENV === 'production', secure: process.env.NODE_ENV === 'production' }).json({
            success: true,
            token,
            message: 'logged in successfully...'
        })
    }
    catch (error) {
        console.log(error)
    }
    
}