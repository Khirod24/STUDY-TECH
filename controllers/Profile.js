const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async(req,res)=>{
    try{
        //DATA FETCH
        const {dateOfBirth="", about="", contactNumber, gender}= req.body;
        //GET USERID
        const id = req.user.id;
        //DATA VALIDATION
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"ALL FIELDS ARE REQUIRED.."
            })
        }
        //FIND PROFILE
        const userDetails = await User.findById(id);
        const profileId = await userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //UPDATE PROFILE
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        return res.status(200).json({
            success:true,
            message:"PROFILE UPDATED SUCCESSFULLY",
            profileDetails,
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            error:e.message,
        })
    }
}

//DELETE ACCOUNT
//explore:how can we schedule this deletion operation
exports.deleteAccount = async(req,res)=>{
    try{
        //GET ID
        const id = req.user.id;
        //VALIDATION
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"USER NOT FOUND",
            })
        }
        //DELETE PROFILE
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //todo:unenroll user from all enrolled courses
        //DELETE USER
        await User.findByIdAndDelete({_id:id});

        return res.status(200).json({
            success:true,
            message:"USER DELETED SUCCESSFULLY..."
        })
    }catch(e){
        res.status(500).json({
            success:false,
            message:"USER CAN'T BE DELETED SUCCESSFULLY!"
        })
    }
}

exports.getAllUserDetails = async(req,res)=>{
    try{
        //GET ID
        const id = req.user.id;

        //VALIDATION AND GET USER DETAILS
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        return res.status(200).json({
            success:true,
            message:"USER DATA FETCHED SUCCESSFULLY!!"
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
}