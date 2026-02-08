import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { User } from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
dotenv.config()

const verifyToken = async(req, _,next) =>{

   const token =  await req.cookies?.accessToken || req.heder("Authorization").replace("Bearer ", " ")

   if (!token) {
      throw new ApiError(401, "Unauthorized user")
   }

   const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

   const user = await User.findById(decodedToken?._id).select("-refreshToken, -password")

   if (!user) {
      throw new ApiError(404, "user not found")
   }

   req.user = user
   next()
}

export default verifyToken