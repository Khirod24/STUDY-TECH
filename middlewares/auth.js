const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth=async(req,res,next)=>{
    try{
        //EXTRACT TOKEN
        const token = req.cookies.token || req.body.token || req.header("Authorisation").replace("Bearer ","");
        //IF TOKEN MISSING
        if(!token){
            return res.status(401).json({
                success:false,
                message:"TOKEN IS MISSING",
            })
        }

        //VERIFY TOKEN
        try{
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
        }catch(e){
            //VERIFFICATION ISSUE
            return res.status(401).json({
                success:false,
                message:"INVALID TOKEN",
            })
        }
        next();
    }
    catch(e){
        return res.status(401).json({
            success:false,
            message:"SOMETHING WENT WRONG WHILE VALIDATING TOKEN"
        })
    }
}

//IS STUDENT?
exports.isStudent = async(req,res,next)=>{
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"THIS IS A PROTECTED ROUTE FOR STUDENT ONLY!"
            })
        }
        next();
    }catch(e){
        return res.status(500).json({
            success:false,
            message:"USER ROLE CAN NOT BE VERIFIED, PLEASE TRY AGAIN!"
        })
    }
}

//IS INSTRUCTOR?
exports.isInstructor = async(req,res,next)=>{
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"THIS IS A PROTECTED ROUTE FOR INSTRUCTOR ONLY!"
            })
        }
        next();
    }catch(e){
        return res.status(500).json({
            success:false,
            message:"USER ROLE CAN NOT BE VERIFIED, PLEASE TRY AGAIN!"
        })
    }
}

//IS ADMIN?
exports.isAdmin = async(req,res,next)=>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"THIS IS A PROTECTED ROUTE FOR ADMIN ONLY!"
            })
        }
        next();
    }catch(e){
        return res.status(500).json({
            success:false,
            message:"USER ROLE CAN NOT BE VERIFIED, PLEASE TRY AGAIN!"
        })
    }
}