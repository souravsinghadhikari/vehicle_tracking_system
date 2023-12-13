const express = require("express");
const path = require("path");
const {authenticator}= require("../authenticator");
const bcrypt = require("bcrypt");
const usermodel = require("../models/user");
const vehiclemodel = require("../models/vehicle");
const jwt = require("jsonwebtoken");

const router = express.Router();

// get api
  router.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,"../public/register.html"));
  })
  
  router.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,"../public/login.html"));
  })
  
  router.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname,"../public/map.html"));
  })
  
  // post request
  
  router.post('/register',(req,res)=>{
    const data = req.body;
    console.log(data);
    if(data.password!==data.confirmpassword){
      res.send("Passwords do not match. Please enter them again.");
      return ;
    }
    bcrypt.hash(data.password,5,async function (err,hash){
      if (err) return res.send("some error while crypting");
      // driver condition
    if(data.vehicleid!=''){
      const{name,email,password,vehicleid:vehicleid} = data;
      let vehicle = new vehiclemodel ({email,password:hash,vehicleid:vehicleid,rating :5});
      await vehicle.save();
    }else {
      const {name,email,password}=data;
      let user = new usermodel ({name,email,password:hash,ecoCoupon : 0});
      await user.save();
    }
    res.redirect("/user/map");
    })
  })
  router.post('/login',async(req,res)=>{
    const {email,password}= req.body;
    let option = {
      expiresIn : "5h"
    }
      let data = await usermodel.find({email});
      let bata = await vehiclemodel.find({email});
      if(data.length>0){
        bcrypt.compare(password,data[0].password,function(err,result){
          if(err) return res.send("something went wrong");
          if(result){
            let token = jwt.sign({userid : data[0]._id,email:data[0].email},process.env.SecretkeyAuthenticator,option);
            res.cookie("jwt",token);
            res.clearCookie('driver', { path: '/' });
            res.redirect("/user/map");
          }
        })
      }else if(bata.length>0){
        bcrypt.compare(password,bata[0].password,function(err,result){
          if(err) return res.send("something went wrong");
          if(result){
            res.cookie("driver",'yes');
            res.redirect("/user/map");
          }
        })
      }
      else {
        res.send("user does not exist");
      }
  });

  router.get('/profileinfo',authenticator , async (req, res) => {
    const userid=req.body.user;
    const email = userid.email;
    let data = await usermodel.findOne({email});
    // console.log(data);
    res.json(data);
  });

  router.get('/profile',(req,res)=>{
    res.sendFile(path.join(__dirname,"../public/profile.html"))
  })

  router.get('/about',(req,res)=>{
    res.sendFile(path.join(__dirname,"../public/about.html"))
  })

  module.exports = router ;