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

        //USER ALREADY PAID FOR THE SAME COURSE
        const uid = new mongoose.Types.ObjectId(userId);  //string to objectId
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"STUDENT IS ALREADY ENROLLED.."
            })
        }
    }catch(e){
        console.error(e);
        return res.status(500).json({
            success:false,
            message:e.message,
        })
    }

    //ORDER CREATE
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{courseId: course_id, userId},
    };

    try{
        //INITIATE THE PAYMENT USING RAZORPAY
        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        res.status(200).json({
            success:true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })
    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"COULDN'T INITIATE THE ORDER!!"
        })
    }
};

//VERIFY SIGNATURE OF RAZORPAY AND SERVER
exports.verifySignature = async(req,res)=>{
    const webhookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("PAYMENT IS AUTHORIZED");
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try{
            //FULFILL THE ACTION

            //FIND THE COURSE AND ENROLL THE STUDENT IN IT..
            const enrolledCourse = await Course.findOneAndUpdate({_id:courseId},{
                $push:{studentsEnrolled:userId}
            },{new:true});

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"COURSE NOT FOUND"
                })
            }
            console.log(enrolledCourse);

            //FIND THE STUDENT AND ADD COURSE TO THE ENROLLEDCOURSES LIST
            const enrolledStudent = await User.findOneAndUpdate({_id:userId},{
                $push:{courses:courseId}
            },{new:true});
            console.log(enrolledStudent);

            //SEND CONFIRMATION MAIL
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "FROM STUDYTECH",
                "Congrats, You are onboarded into new StudyTech course..."
            )
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"SIGNATURE VERIFIED AND COURSE ADDED!!"
            })

        }catch(e){
            console.log(e);
            return res.status(500).json({
                success:false,
                message:e.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"INVALID REQUEST.."
        })
    }
}

