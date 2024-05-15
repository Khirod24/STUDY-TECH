const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async(req,res)=>{
    try{
        //DATA FETCH
        const {sectionName, courseId} = req.body;
        //DATA VALIDATION
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"MISSING PROPERTIES"
            })
        }
        //CREATE SECTION
        const newSection = await Section.create({sectionName});
        //UPDATE COURSE WITH SECTION ID
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,{
            $push:{courseContent:newSection._id}
        },{new:true});

        //use populate to replace section/ subsections both in the updatedCourseDetails

        return res.status(200).json({
            success:true,
            message:"SECTION CREATED SUCCESSFULLY..",
            updatedCourseDetails,
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:"UNABLE TO CREATE SECTION, PLEASE TRY AGAIN..",
            error:e.message,
        })
    }
}

exports.updateSection = async(req,res) =>{
    try{
        //DATA FETCH
        const {sectionName, courseId} = req.body;
        //DATA VALIDATION
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"MISSING PROPERTIES"
            })
        }

        //UPDATE DATA
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        return res.status(200).json({
            success:true,
            message:"SECTION UPDATED SUCCESSFULLY..",
            updatedCourseDetails,
        })

    }catch(e){
        return res.status(500).json({
            success:false,
            message:"UNABLE TO UPDATE SECTION, PLEASE TRY AGAIN..",
            error:e.message,
        })
    }
}

exports.deleteSection = async(req,res)=>{
    try{
        //GET ID - assume we r sending id in params
        const {sectionId} = req.params;
        await Section.findByIdAndDelete(sectionId);
        //todo:we need to delete the entry from course schema

        return res.status(200).json({
            success:true,
            message:"SECTION DELETED SUCCESSFULLY..."
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:"UNABLE TO DELETE SECTION, PLEASE TRY AGAIN..",
            error:e.message,
        })
    }
}