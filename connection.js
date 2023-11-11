const mongoose = require("mongoose");

async function connectMongoDb (url){
    try {
        await mongoose.connect(url);
        console.log("connected to database");
      } catch (error) {
        console.log("Error Connecting to DB" + error);
      }
}

module.exports = {
  connectMongoDb ,
}