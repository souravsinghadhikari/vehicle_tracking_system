const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const usermodel = require("./models/user");
const vehiclemodel = require("./models/vehicle");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const vehicle = require("./models/vehicle");
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

app.get('/home', (req, res) => {
  res.send("homepagewithlogo");
})

app.get('/register',(req,res)=>{
  res.send("register page");
})

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname,"public","index.html"));
})

// post request

app.post('/register',(req,res)=>{
  const data = req.body;
  console.log(data);
  

  bcrypt.hash(data.password,5,async function (err,hash){
    if (err) return res.send("some error while crypting");
    // driver condition
  if(Object.keys(data).length >= 4){
    const{name,email,password,vehicleid} = data;
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

app.post('/',(req,res)=>{
  const data = req.body;
  console.log(data);
  

  bcrypt.hash(data.password,5,async function (err,hash){
    if (err) return res.send("some error while crypting");
    // driver condition
  if(Object.keys(data).length >= 4){
    const{name,email,password,vehicleid} = data;
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