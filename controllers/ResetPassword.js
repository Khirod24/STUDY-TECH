const User = require("../models/User");
const mailSender = require("../utils/mailSender")
const bcryptjs= require("bcryptjs");

//1. RESET PASSWORD TOKEN
exports.resetPasswordToken = async(req,res)=>{
    try{
        //FETCH EMAIL
        const {email} = req.body.email;
        //EMAIL VALIDATION OF USER
        const user = await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:"EMAIL NOT RESISTERED!!",
            })
        }
        //GENERATE RANDOM TOKEN
        const token = crypto.randomUUID();
        //UPDATE USER BY ADDING TOKEN AND EXPIRY TIME
        const updatedUser = await User.findOneAndUpdate({email:email},{token:token,resetPasswordExpires:Date.now()+5*60*1000},{new:true});

        //GENERATE URL
        const url = `http://localhost:3000/update-password/${token}`;
        //SEND URL IN MAIL
        await mailSender(email,"Reset Password Link",`Reset Password Link: ${url}`);
        return res.json({
            success:false,
            message:"EMAIL SENT SUCCESSFULLY. PLEASE CHECK EMAIL AND CHANGE PASSWORD!"
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"SOMETHING WENT WRONG WHILE SENDING RESET PASSWORD MAIL!!"

        })
    }
}

//2. RESET PASSWORD
exports.resetPassword=async(req,res)=>{
    try{
        //DATA FETCH
        const {password, confirmPassword, token} = req.body;
        //DATA VALIDATION
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:"PASSWORDS NOT MATCHING"
            })
        }
        //GET USER DETAILS USING TOKEN
        const userDetails = await User.findOne({token:token});
        //IF NOT DB ENTRY - INVALID TOKEN
        if(!userDetails){
            return res.json({
                success:false,
                message:"INVALID TOKEN",
            })
        }
        //TOKEN TIME CHECK
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"TOKEN EXPIRED. PLEASE REGENERATE YOUR TOKEN"
            })
        }
        //HASH PASSWORD
        const hashedPassword = await bcryptjs.hash(password,10);

        //UPDATE PASSWORD
        await User.findByIdAndUpdate({token:token},{password:hashedPassword},{new:true});
        return res.status(200).json({
            success:true,
            message:"PASSWORD RESET SUCCESSFUL"
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"SOMETHING WENT WRONG WHILE SENDING RESET PASSWORD MAIL"
        })
    }
}