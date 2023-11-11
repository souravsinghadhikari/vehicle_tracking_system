// authenticator function 1
const jwt = require("jsonwebtoken");

function authenticator(req, res, next) {
    
  const token = req.cookies.jwt;
  // console.log(token);
    if (token==null) {
        return res.status(401).json({ message: 'No token provided' });
      }
    jwt.verify(token,process.env.SecretkeyAuthenticator, (error, decode) => {
      if (error) {
        console.error(error);
        return res.status(401).send("Error while authenticating");
      }
      if (decode) {
        req.body.user = decode;
        next();
      } else {
        return res.status(401).send("Invalid token");
      }
    });
  }
  

module.exports = {
    authenticator,
}