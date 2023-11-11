const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
require('dotenv').config({ path: './.env' });
const userRouter = require("./router/user")
const {connectMongoDb} = require("./connection")
const cookieParser = require('cookie-parser')

// const {mapLoaderid} = require(path.join(__dirname,"public","index.js"))
// require 

const app = express();

// connection to database 

connectMongoDb(process.env.MongoDbUrl) ;

//middlewares

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

// socket io connection

const io = require("socket.io")(process.env.SOCKETPORT, {
  cors: {
    origin: [`http://localhost:${process.env.PORT}`]
  }
});

io.on("connect", (socket) => {
  console.log("connected to socket from server");
  socket.on("sendlocation", (data) => {
    console.log('data reached to server');
    socket.broadcast.emit("printlocation", data); // Broadcasting to all clients
  });
});

io.on("error", (error) => {
  console.error("Socket.IO error:", error);
});

// API's

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"public","home.html"));
})

app.use("/user",userRouter);

// listening to port

  app.listen(process.env.PORT,()=>{
    console.log(`connected to port ${process.env.PORT}`);
  });
