const mongoose= require("mongoose");

const userSchema = mongoose.Schema({
    email : String,
    password : String,
    ecoCoupon : Number
})

const user = mongoose.model("user",userSchema);

module.exports = user;