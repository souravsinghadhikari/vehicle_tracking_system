const mongoose= require("mongoose");

const userSchema = mongoose.Schema({
    fullName: String,
    email : String,
    password : String,
    ecoCoupon : Number
})

const user = mongoose.model("user",userSchema);

module.exports = user;