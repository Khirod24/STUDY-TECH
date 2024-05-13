const Tag = require("../models/Tags");

//HANDLER FUCTION FOR TAG

exports.createTag = async(req,res)=>{
    try{
        //DATA FETCH
        const {name, description} = req.body;
        //DATA VALIDATION
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"ALL FIELDS ARE REQUIRED"
            })
        }
        //CREATE DB ENTRY
        const tagDetails = await Tag.create({
            name:name, description:description,
        })
        console.log(tagDetails);
        return res.status(200).json({
            success:true,
            message:"TAG CREATED SUCCESSFULLY"
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
};

//getAllTags HANDLER FUNCTION

exports.showAllTags = async(req,res)=>{
    try{
        const allTags = await Tag.find({},{name:true, description:true});
        res.status(200).json({
            success:true,
            message:"ALL TAGS RETURNED SUCCESSFULLY!",
            allTags,
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
}