const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

//CREATE RATING
exports.createRating = async(req,res)=>{
    try{
        //GET ID
        const userId = req.user.id;
        //DATA FETCH
        const {reting, review, courseId} = req.body;
        //CHECK IF USER IS ENROLLED OR NOT
        const courseDetails = await Course.findOne({_id:courseId, 
                              studentsEnrolled:{$elemMatch:{$eq:userId}}})

        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"STUDENT IS NOT ENROLLED IN THIS COURSE"
            })
        }

        //CHECK IF USER ALREADY REVIEWED THE COURSE
        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId, course:courseId
        })
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"COURSE IS ALREADY REVIEWED BY THE USER"
            })
        }

        //CREATE RATING AND REVIEW
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course:courseId,
            user:userId,
        })
        //UPDATE COURSE WITH THIS RATING/REVIEW
        const updatedCourseDetails = await Course.findByIdAndUpdate({_id:courseId},{
            $push:{
                ratingAndReviews:ratingReview._id,
            }
        },{new:true})
        console.log(updatedCourseDetails);

        return res.status(200).json({
            success:true,
            message:"RATING AND REVIEW CREATED SUCCESSFULY!!",
            ratingReview,
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
}

//AVERAGE RATING
exports.getAverageRating = async(req,res)=>{
    try{
        //GET COURSEID
        const courseId = req.body.courseId;

        //CALCULATE AVG RATING
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },{
                $group:{
                    _id:null,
                    averageRating: {$avg:"$rating"}
                }
            }
        ])

        //RETURN RATING
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        //IF NO RATING/REVIEW EXIST
        return res.status(200).json({
            success:true,
            message:"Average Rating is 0, no ratings given till now!",
            averageRating:0,
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
}

//GET ALL RATINGS
exports.getAllRating = async(req,res)=>{
    try{
        const allReviews = await RatingAndReview.find({}).sort({rating:"desc"}).populate({
            path:"user",
            select:"firstName lastName email image",
        }).populate({
            path:"course",
            select:"courseName"
        }).exec();

        return res.status(200).json({
            success:true,
            message:"ALL REVIEWS FETCHED SUCCESSFULLY..",
            data:allReviews,
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
}