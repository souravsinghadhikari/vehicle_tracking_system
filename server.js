const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const usermodel = require("./models/user");
const vehiclemodel = require("./models/vehicle");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const {mapLoaderid} = require(path.join(__dirname,"public","index.js"))
// require 

const app = express();

//middlewares

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// socket io connection

const io = require("socket.io")(8080, {
  cors: {
    origin: ['http://localhost:3000']
  }
});

io.on("connect", (socket) => {
  console.log(socket.id);
  socket.on("sendlocation",(data,callback)=>{
    console.log('data reached to server');
    socket.broadcast.emit("printlocation",data);
    callback('broadcasted from server');
  })
});

io.on("error", (error) => {
  console.error("Socket.IO error:", error);
});




// get api

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"public","home.html"));
})

app.get('/register',(req,res)=>{
  res.send(path.join(__dirname,"public","register.html"));
})

app.get('/login',(req,res)=>{
  res.send(path.join(__dirname,"public","login.html"));
})

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname,"public","map.html"));
})

// post request

app.post('/register',(req,res)=>{
  const data = req.body;
  console.log(data);
  if(data.password!=data.confirmpassword){
    res.send("Passwords do not match. Please enter them again.");
    return ;
  }
  bcrypt.hash(data.password,5,async function (err,hash){
    if (err) return res.send("some error while crypting");
    // driver condition
  if(data.vehicleid!=''){
    const{name,email,password,vehicleid:vehicleid} = data;
    let vehicle = new vehiclemodel ({vehicleid:vehicleid});
    await vehicle.save();
  }else {
    const {name,email,password}=data;
    let user = new usermodel ({email,password:hash});
    await user.save();
  }
  res.send("data is saved");
  })
})

app.post('/login',async(req,res)=>{
  const {email,password}= req.body;
  let option = {
    expiresIn : "5h"
  }
  try{
    let data = await usermodel.find({email});
    if(data.length>0){
      let token = jwt.sign({userid : data[0]._id},"sourav",option);
      bcrypt.compare(password,data[0].password,function(err,result){
        if(err) return res.send("something went wrong");
        if(result){
          console.log(token);
          res.send("loged in succesfuly" );
        }else {
          res.send("wrong password");
        }
      })
    }
    else {
      res.send("user does not exist");
    }
  }catch(error) {
    res.send("error" + error);
  }
})

// listening to port

  app.listen(3000,async()=>{
  console.log('connected to port 3000');
  // connecting to database
  try {
      await mongoose.connect("mongodb+srv://souravadhikari:sourav%4012mongodb@cluster0.nk4yjcv.mongodb.net/technauts");
      console.log("connected to database");
    } catch (error) {
      console.log("Error Connecting to DB" + error);
    }
  });