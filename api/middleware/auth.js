const jwt = require('jsonwebtoken');
require('dotenv').config();

//verify if user is logged in
const verifyToken = (req,res,next) => {
  const authHeader = req.headers.authorization;

  if(authHeader){
    const token = authHeader.split(' ')[1];

    const secret = process.env.JWT_SECRET || 'fallback_secret_key';

    jwt.verify(token,secret, (err,user) => {
      if(err){
        console.log('JWT Error:',err.message);
        return res.status(403).json({
          message: 'Token is invalid or has expired'
        });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({
      message: 'Authentication required'
    });
  }
};

const verifyAdmin = (req,res,next)=>{
  verifyToken(req,res,()=>{
    if(req.user.isAdmin){
      next();
    } else {
      res.status(403).json({
        message: 'Admin privileges required'
      });
    }
  });
};

module.exports = {verifyToken,verifyAdmin};