import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()



const generateRefreshandAccessToken = async (userid) =>{
try {
      const user = await User.findById(userid)

      if (!user) {
        throw new ApiError(404, "user not found")
      }

      console.log(user);
      


      const accessToken = jwt.sign(
        {
            _id: userid
        },
           process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
       )



      const refreshToken = jwt.sign(
        {
            _id: userid
        },
        
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )

      console.log("accessToken :", accessToken);
      console.log("refreshToken :", refreshToken);
      
      
    
      user.refreshToken = refreshToken

      await user.save({validateBeforeSave: false})
    
      return {refreshToken, accessToken}
} catch (error) {
    console.log("🔥 REAL ERROR 👉", error);
    throw new ApiError(500,  "Something went wrong while generating referesh and access token")
}
}


const registerUser = AsyncHandler( async (req,res) =>{
  //  get resive data from fronted 
  //check the data is not mt and user not allready exi.
  //handle the file and chek the file up,od the cloudinary
  //create the user 
  // find the user and remove some fileds ex- refreshtoken and password
  //check the user creation successfully
  //return responce 

 const {username, email, password } =  req.body

 console.log("email : ", email);

 if (!username) {
    throw new ApiError(400, "username is required")
 }
 if (!email) {
    throw new ApiError(400, "email is required")
 }
 if (!password) {
    throw new ApiError(400, "password is required")
 }


  const existedUser =  await User.findOne({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(401, "user allready exist")
    }

   const profileLocalPath =  req.files?.profileImage[0].path

//    console.log(profileLocalPath);
   
   if (!profileLocalPath) {
    throw new ApiError(409, "profileLocalPath is missing")
   }

 const profileimage  = await uploadOnCloudinary(profileLocalPath)

 if (!profileimage) {
    throw new ApiError(400, "profile not uploded on cloudinary ")
 }

 const newUser = await User.create({
    username,
    email,
    profileImage: profileimage.url,
    password
 })

const createUser =  await User.findById(newUser._id).select("-refreshToken -password")

if (!createUser) {
    throw new ApiError(500, " Somthing went wrong while registering the user")
}

return  res.status(201).json(
    new ApiResponse(201, createUser, "user registerd successfully")
    )
 





 
})

const logiUser = AsyncHandler( async (req, res) => {
    //  receive the data fronted
    //find the user
    //compare the password 
    
    //remove other fields like refreshToken and password
    //generate access and refreshToken
    //generate options
    //returs responce and save the token user cokkie and database


       const {username, password} = req.body
       
       if (!username) {
        throw new ApiError(400, "username required")
       }
       if (!password) {
        throw new ApiError(400, "password required")
       }

     const user =   await User.findOne({
        $or: [{username}]
       })

       if (!user) {
         throw new ApiError(400, "invalid user")
       }

       //chek the password

    const isValidPassword =    await user.isPasswordCorrect(password)

    if (!isValidPassword) {
          throw new ApiError(404, "invalid credential")
    }

    const {refreshToken, accessToken} = await generateRefreshandAccessToken(user._id)

   const logedInUser =  await User.findById(user._id).select("-refreshToken -password")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: logedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )


})

const logOutUser = AsyncHandler( async(req,res) =>{
       
          await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refresToken: 1
                },

            },
            {
                new: true
            }
          )

          const options = {
            httpOnly: true,
            secure: true
          }


          return res.status(200)
          .clearCookie("refreshToken", options)
          .clearCookie("accessToken", options)
          .json(
            new ApiResponse(200, 'user loged out ')
          )

})


const refreshAccessToken = AsyncHandler(async(req,res) =>{
   const incomeingRefreshToken =  req.cookies.refresToken || req.body.refresToken

   if (!incomeingRefreshToken) {
     throw new ApiError(400, "unauthorised request")
   }
try {
    
      const verifyRefreshToken =  jwt.verify(incomeingRefreshToken, process.env.ACCESS_TOKEN_SECRET)
    
     const user = await User.findById(verifyRefreshToken?._id)
    
     if (!user) {
        throw new ApiError(400, "invalid refreshToken")
     }
    
     if (incomeingRefreshToken !== user.refresToken) {
        throw new ApiError(401, "refreshToken is expired or used")
     }
    
       const {accessToken, newRefreshToken} = generateRefreshandAccessToken(user._id)
    
       const options = {
        httpOnly: true,
        secure: true
       }
    
       return res.status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newRefreshToken, options )
       .json(
         new ApiResponse(200, 
            {
                accessToken, refresToken: newRefreshToken, 
            }, "access token refresh")
       )
} catch (error) {
    throw new ApiError(401, error.message || "invalid refreshToken")
}
})


const changePassword = AsyncHandler( async (req,res) =>{

    const {oldPassword, newPassword} = req.body

    const user =  await User.findById(req.user?._id)

    const ispasswordCorrect =  user.isPasswordCorrect(oldPassword)

    if(!ispasswordCorrect){

        throw new ApiError(401, "invalid password")
    }

    user.password = newPassword
    user.save({validateBeforeSave: false})

    res.status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"))
})

const getCurrentUser = AsyncHandler( async(req,res) => {
    return res.status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})

const updateAccountDetail = AsyncHandler( async(req,res) =>{
      const {username, email} = req.body

      if (!(username && email)) {
        throw new ApiError (400, "please fill user detailed")
      }

     const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                username: username,
                email: email
            }
        },
        {
            new: true
        }
      ).select("-password")

      return res.status(200)
      .json(
        new ApiResponse(200, user, "Account detail update successfully")
      )
})

const updateProfileImage = AsyncHandler( async(req,res) =>{
      
      
         const profileImageLocalPath =   req.file?.path

         if (!profileImageLocalPath) {
            throw new ApiError(400, "profileImage file is missing")
         }

        const profileImage =  await uploadOnCloudinary(profileImageLocalPath)

        if (!profileImage) {
            throw new ApiError(401, "Error while uploding profileImage on cloudinary")
        }

       const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    profileImage: profileImage.url
                }
            },{new: true}
        ).select("-password")

        return res.status(200)
        .json(
            new ApiResponse(200, user, "profileImage updated successfully")
        )
})

export {

    registerUser,
    logiUser,
    logOutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetail,
    updateProfileImage
         }