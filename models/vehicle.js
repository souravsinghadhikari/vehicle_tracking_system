const mongoose= require("mongoose");

const vehicleSchema = mongoose.Schema({
    email : String,
    password : String,
    vehicleid : String,
    rating : Number
})

const vehicle = mongoose.model("vehicle",vehicleSchema);

module.exports = vehicle;
