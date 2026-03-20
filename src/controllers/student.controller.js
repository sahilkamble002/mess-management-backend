import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Student} from "../models/student.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import {generateStudentQR} from "../utils/generateQR.js";
import { authCookieOptions } from "../utils/cookieOptions.js";
import { getMissingJwtEnvVars } from "../utils/jwtConfig.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const missingJwtEnvVars = getMissingJwtEnvVars()

        if (missingJwtEnvVars.length > 0) {
            throw new ApiError(500, `Missing JWT environment variables: ${missingJwtEnvVars.join(", ")}`)
        }

        const student = await Student.findById(userId)

        if (!student) {
            throw new ApiError(404, "Student not found while generating tokens")
        }

        const accessToken = student.generateAccessToken()
        const refreshToken = student.generateRefreshToken()

        student.refreshToken = refreshToken
        await student.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(error?.statusCode || 500, error?.message || "Something went wrong while generating referesh and access token")
    }
}

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const student = await Student.findById(decodedToken?._id)
    
        if (!student) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== student?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(student._id)

        return res
        .status(200)
        .cookie("accessToken", accessToken, authCookieOptions)
        .cookie("refreshToken", newRefreshToken, authCookieOptions)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const registerStudent = asyncHandler( async (req, res) => {
    // get student details from frontend
    // validation - not empty
    // check if student already exists: rollno, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create student object - create entry in db
    // remove password and refresh token field from response
    // check for student creation
    // return res


    const {name, email, rollno, password, cardno, discipline, regmess } = req.body

    const requiredFields = [name, email, rollno, password, cardno, discipline, regmess]

    if (
        requiredFields.some((field) => field === undefined || field === null || String(field).trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const normalizedEmail = email.toLowerCase().trim()
    const normalizedRollNo = rollno.toLowerCase().trim()
    const normalizedCardNo = Number(cardno)

    if (!Number.isFinite(normalizedCardNo)) {
        throw new ApiError(400, "Card number must be a valid number")
    }

    const existedStudent = await Student.findOne({
        $or: [{ rollno: normalizedRollNo }, { email: normalizedEmail }, { cardno: normalizedCardNo }]
    })

    if (existedStudent) {
        throw new ApiError(409, "Student with email, rollno, or card number already exists")
    }
   
    const qrcode = await generateStudentQR(normalizedRollNo);

    const student = await Student.create({
        name,
        email: normalizedEmail, 
        rollno: normalizedRollNo, 
        password, 
        cardno: normalizedCardNo, 
        discipline, 
        regmess,
        qrcode
    })

    const createdStudent = await Student.findById(student._id).select(
        "-password -refreshToken"
    )

    if (!createdStudent) {
        throw new ApiError(500, "Something went wrong while registering the student")
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(student._id);

    // Set HTTP-only cookies
    res.cookie("accessToken", accessToken, authCookieOptions);

    res.cookie("refreshToken", refreshToken, authCookieOptions);

    return res.status(201).json(
        new ApiResponse(201, { student: createdStudent, accessToken, refreshToken }, "Student registered successfully")
    );

} )

const loginStudent = asyncHandler(async (req, res) =>{
    // req body -> data
    // rollno or email
    //find the student
    //password check
    //access and referesh token
    //send cookie

    const {rollno, password} = req.body
    console.log(rollno);

    if (!rollno) {
        throw new ApiError(400, "rollno is required")
    }

    const student = await Student.findOne({
        $or: [{rollno}]
    })

    if (!student) {
        throw new ApiError(404, "Student does not exist")
    }

    const isPasswordValid = await student.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid student credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(student._id)

    const loggedInStudent = await Student.findById(student._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, authCookieOptions)
    .cookie("refreshToken", refreshToken, authCookieOptions)
    .json(
        new ApiResponse(
            200, 
            {
                student: loggedInStudent, accessToken, refreshToken
            },
            "Student logged In Successfully"
        )
    )

})

const logoutStudent = asyncHandler(async(req, res) => {
    await Student.findByIdAndUpdate(
        req.student._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken", authCookieOptions)
    .clearCookie("refreshToken", authCookieOptions)
    .json(new ApiResponse(200, {}, "Student logged Out"))
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const student = await Student.findById(req.student?._id)
    const isPasswordCorrect = await student.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    student.password = newPassword
    await student.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.student,
        "Student fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {name, email} = req.body

    if (!name || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const student = await Student.findByIdAndUpdate(
        req.student?._id,
        {
            $set: {
                name,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, student, "Account details updated successfully"))
});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    //TODO: delete old image - assignment

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const student = await Student.findByIdAndUpdate(
        req.student?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, student, "Avatar image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is missing")
    }

    //TODO: delete old image - assignment


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on avatar")
        
    }

    const student = await Student.findByIdAndUpdate(
        req.student?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, student, "Cover image updated successfully")
    )
})


const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {rollno} = req.params

    if (!rollno?.trim()) {
        throw new ApiError(400, "rollno is missing")
    }

    const channel = await Student.aggregate([
        {
            $match: {
                rollno: rollno?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.student?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                name: 1,
                rollno: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "Student channel fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const student = await Student.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.student._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        name: 1,
                                        rollno: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            student[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})


export{
    registerStudent,
    loginStudent,
    logoutStudent,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}
