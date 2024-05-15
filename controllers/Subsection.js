const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

exports.createSubSection = async(req,res)=>{
    try{
        //DATA FETCH
        const {sectionId, title, timeDuration ,description} = req.body;
        //EXTRACT VIDEO FILE
        const video = req.files.videoFile;
        //DATA VALIDATION
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:true,
                message:"ALL FIELDS ARE REQUIRED",
            })
        }

        //UPLOAD VIDEO TO CLOUD
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //CREATE A SUB SECTION
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })

        //UPDATE SECTION WITH THESE SUB SECTION DETAILS
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                SubSection:subSectionDetails._id,
            }
        },{new:true});
        //hw: log updated section here after adding populate query

        return res.status(200).json({
            success:true,
            message:"SUB SECTION CREATED SUCCESSFULLY...",
            updatedSection
        })
    }catch(e){
        console.error(e);
        return res.status(500).json({
            success:false,
            message:"UNABLE TO CREATE SUBSECTION, PLEASE TRY AGAIN.."
        })
    }
}

//HW:UPDATE SUB SECTION

//HW: DELETE SUB SECTION