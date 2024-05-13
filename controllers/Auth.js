const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profile");

const otpGenerator = require("otp-generator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//SEND OTP
exports.sendOTP = async(req,res)=>{
    try{
        //FETCH EMAIL
        const {email} = req.body;
        //CHECK FOR EXISTING USER
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(401).json({
                success:false,
                message:"USER ALREADY REGISTERED!"
            });
        }

        //OTP GENERATE
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP GENERATED: ",otp);

        //CHECK FOR UNIQUE OTP
        let result = await OTP.findOne({otp: otp});
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email,otp};
        //OTP ENTRY IN DB
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);
        res.status(200).json({
            success:true,
            message:'OTP SENT SUCCESSFULLY..',
            otp,
        })

    }catch(e){
        console.log(error);
        return res.staus(500).json({
            success:false,
            message:error.message,
        })
    }
}

//SIGN UP
exports.signUp = async(req,res)=>{
    try{
        //DATA FETCH
        const{firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp}=req.body;
        //DATA VALIDATION
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"ALL FIELDS ARE REQUIRED!",
            })
        }
        //COMPARE PASSWORDS
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"PASSWORDS NOT MATCHED, PLEASE TRY AGAIN!"
            })
        }
        //EXISTING USER
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"USER ALREADY REGISTERED"
            })
        }

        //FIND RECENT OTP STORED FOR USER
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        //OTP VALIDATION
        if(recentOtp.length == 0){
            //OTP NOT FOUND
            return res.status(400).json({
                success:false,
                message:"OTP NOT FOUND!"
            })
        }
        else if(otp !== recentOtp.otp){
            //INVALID OTP
            return res.status(400).json({
                success:false,
                message:"INVALID OTP"
            })
        }

        //HASH PASSWORD
        const hashedPassword = await bcryptjs.hash(password,10);
        //CREATE ENTRY IN DB
        const profileDeatils = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDeatils._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`
        })
        return res.status(200).json({
            success:true,
            message:"USER REGISTERED SUCCESSFULLY",
            user,
        })
    }catch(e){
        return res.staus(500).json({
            success:false,
            message:"USER NOT REGISTERED, PLEASE TRY AGAIN"
        })
    }
}

//LOG IN
exports.login= async(req,res)=>{
    try{
        //DATA FETCH
        const{email,password}= req.body;
        //DATA VALIDATION
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"ALL FIELDS ARE REQUIRED",
            })
        }
        //CHECK EXISTING USER
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"USER IS NOT REGISTERED. PLEASE SIGNUP FIRST!"
            })
        }

        //COMPARE PASSWORDS THEN GENERATE JWT
        if(await bcryptjs.compare(password, user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                role:user.role,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{expiresIn:"2h",});
            user.token = token;
            user.password = undefined;
            
            //SEND COOKIE IN RESPONSE
            const options = {
                expires: new Date(Date.now()+ 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"LOGGEDIN IN SUCCESSFULLY!!"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"INCORRECT PASSWORD, PLEASE ENTER CORRECT PASSWORD"
            })
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"LOGIN FAILED, PLEASE TRY AGAIN"
        })
    }
}