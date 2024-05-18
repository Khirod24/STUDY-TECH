const Category = require("../models/Category");

//HANDLER FUCTION FOR CATEGORY
exports.createCategory = async(req,res)=>{
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
        const CategoryDetails = await Tag.create({
            name:name, description:description,
        })
        console.log(CategoryDetails);
        return res.status(200).json({
            success:true,
            message:"CATEGORIES CREATED SUCCESSFULLY"
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
};

//getAllTags HANDLER FUNCTION
exports.showAllCategories = async(req,res)=>{
    try{
        const allCategorys = await Category.find({},{name:true, description:true});
        res.status(200).json({
            success:true,
            data:allCategorys,
        })
    }catch(e){
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
}

//categoryPageDetails HANDLER FUNCTION
exports.categoryPageDetails = async(req,res)=>{
    try{
        //GET CATEGORYID
        const {categoryId} = req.body;
        //GET COURSES FOR SPECIFIED CATEGORY
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();
        // console.log(selectedCategory);

        //VALIDATION
        if(!selectedCategory){
            // console.log("CATEGORY NOT FOUND");
            return res.status(404).json({
                success:false,
                message:"CATEGORY NOT FOUND",
            })
        }

        //GET COURSES FOR DIFFERENT CATEGORIES
        const differentCategories = await Category.find({
            _id:{$ne:categoryId},
        }).populate("courses").exec();

        //GET TOP SELLING COURSES

        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories
            }
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }
}
