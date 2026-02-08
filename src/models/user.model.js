import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const userModel = new Schema(
    {
        username:{
            type: String,
            required: true,
            lowercase: true,
        
            
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: [true, "password is required"]
          
        },

        profileImage: {
            type: String,
            requireed: true
            
        },
        refresToken:{
            type: String
        }
       

    }, {
        timestamps: true
    }) 

    userModel.pre("save", async function(){
        if (!this.isModified("password")) return;
             
        this.password = await bcrypt.hash(this.password, 10)
      
    })

    userModel.methods.isPasswordCorrect = async function(password){
       return await bcrypt.compare(password, this.password)
    }

    // userModel.methods.generateAccessToken = function(userid){
    //     jwt.sign(
    //         {
    //             _id: userid
               

    //         },
    //           process.env.ACCESS_TOKEN_SECRET,

    //         {
    //             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    //         }
    //     )
    // }
    // userModel.methods.generateRefreshToken = function(){
    //     jwt.sign(
    //         {
    //             _id: this._id,

    //         },
    //         process.env.REFRESH_TOKEN_SECRET,

    //         {
    //             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    //         })
    // }

      
      


    export const User = mongoose.model("User", userModel)