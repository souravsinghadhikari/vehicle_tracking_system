const mongoose= require("mongoose");

const vehicleSchema = mongoose.Schema({
    vehicleid : String,
    rating : Number
})

const vehicle = mongoose.model("vehicle",vehicleSchema);

module.exports = vehicle;
