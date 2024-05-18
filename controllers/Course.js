const User = require("../models/User");
const Course = require("../models/Course");
const Tag = require("../models/Tags");

const {uploadImageToCloudinary} = require("../utils/imageUploader");

//CREATE COURSE HANDLER FUNCTION
exports.createCourse = async(req,res)=>{
    try{
        //DATA FETCH
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;
        //GET THUMBNAIL
        const thumbnail = req.files.thumbnailImage;
        
        //DATA VALIDATION
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag  || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"ALL FIELDS ARE REQUIRED"
            })
        }

        //CHECK FOR INSTRUCTOR
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details : ", instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"INSTRUCTOR DETAILS NOT FOUND..",
            })
        }

        //CHECK FOR VAILD TAG
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"TAG DETAILS NOT FOUND..",
            })
        }

        //UPLOAD IMAGE TO CLOUD
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //CREATE NEW COURSE ENTRY IN DB
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //ADD NEW COURSE TO USER SCHEMA OF INSTRUCTOR
        await User.findByIdAndUpdate({_id:instructorDetails._id},{
            $push:{courses:newCourse._id}
        },{new:true});

        // //UPDATE TAG SCHEMA
        // await Tag.findByIdAndUpdate({_id:tag._id},{
        //     course:newCourse._id
        // },{new:true});

        res.status(200).json({
            success:true,
            message:"COURSE CREATED SUCCESSFULLY",
            data:newCourse,
        })
    }catch(e){
        console.error(e);
        return res.status(500).json({
            success:false,
            message:"FAILED TO CREATE COURSE!!",
            error:e.message,
        })
    }
}

//GET ALL COURSES HANDLER FUNCTION
exports.getAllCourses = async(req,res)=>{
    try{
        const allCourses = await Course.find({});
        res.status(200).json({
            success:true,
            message:"DATA FOR ALL COURSES FETCHED SUCCESSFULLY..",
            data:allCourses,
        })
    }catch(e){
        console.error(e);
        return res.status(500).json({
            success:false,
            message:"CANNOT FETCH COURSE DATA",
            error:e.message,
        })
    }
}

//GET COURSE DETAILS
exports.getCourseDetails = async(req,res)=>{
    try{
        //GET ID
        const {courseId} = req.body;
        //FIND COURSE DETAILS
        const courseDetails = await Couse.find({_id:courseId}).populate({
            path:"instructor",
            populate:{path:"additionalDetails"}
        }).populate("category").populate("ratingAndreviews").populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
        }).exec();

        //VALIDATION
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`COULD NOT FIND THE COURSE WITH ${courseId}`,
            })
        }

        return res.status(200).json({
            success:true,
            message:"COURSE DETAILS FETCHED SUCCESSFULLY",
            data:courseDetails,
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:e.message
        })
    }
}