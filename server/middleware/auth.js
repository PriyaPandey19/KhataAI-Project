
//har protected route pe phele ye middleware chalta hai
//token verify karta hai aur req.user set karta hai

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async(req, res, next) => {
    try{
      let token;

      //Authorization: Bearer <token> header se token nikal
      if(req.headers.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
      }

      if(!token){
        return res.status(401).json({message: 'Not authorized, no token'});
      }

      //token verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //decoded.id se user dhudho user req.user mein set karo
      //ab har controller mein requser.id avilable hoga
      req.user = await User.findById(decoded.id).select('-password');

      next();
      
    }catch(err){
        return res.status(401).json({message: 'Token invalid or expired'});
    }
}
module.exports = protect;