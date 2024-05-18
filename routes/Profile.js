// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  signUp,
  sendOtp,
} = require("../controllers/Auth");
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");

const{updateProfilePicture,deleteAccount,updateAdditionalDetails,getUserDetails} = require("../controllers/Profile");

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication


//Authentication routes


// Route for user login
router.post("/login", login)

// Route for user signup
router.post("/signup", signUp)

// Route for sending OTP to the user's email
router.post("/sendotp", sendOtp)

// Route for Changing the password
// router.post("/changepassword", auth, changePassword)


//Reset Password


// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// Route for profile 
router.get("/getuserdetails",auth,getUserDetails);
router.put("/updateprofilepicture", auth, updateProfilePicture);
router.put("/updateadditionaldetails", auth, updateAdditionalDetails);
router.delete("/deleteaccount",auth,deleteAccount);

// Export the router for use in the main application
module.exports = router