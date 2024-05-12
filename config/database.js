const mongoose = require("mongoose");
require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>{console.log("DB CONNECTED SUCCESSFULLY!")})
    .catch((e)=>{
        console.log("DB CONNECTION FAILED");
        console.error(e);
        process.exit(1);
    })
}