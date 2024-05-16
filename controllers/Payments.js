const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const {default:mongoose} = require("mongoose");

//CAPTURE PAYMENT & INITIATE RAZORPAY ORDER
exports.capturePayment = async(req,res)=>{
    //GET COURSEID AND USERID
    const {course_id} = req.body;
    const userId = req.user.id;
    
    //VALIDATION
    //VALID COURSEID
    if(!course_id){
        return res.json({
            success:false,
            message:"PLEASE PROVIDE VALID COURSE ID"
        })
    }
    //VALID COURSEDETAIL
    let course;
    try{
        course= await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"COULD NOT FIND THE COURSE" 
            })
        }
    }catch(e){

    }
}