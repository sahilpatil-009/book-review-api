const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user.model.js");
dotenv.config();

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  try {
    if (!token) {
      return res.status(404).json({ success: false, message: "Not Allowed !" });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if(!decode){
      return res.json({message:"token Invalid decode"});
    }

    const user = await User.findById(decode.id).select(
      "_id firstname lastname email"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.user = user; 
    next();

  } catch (error) {
    res.status(401).json({ error: "Invalid token !" });
  }
};

module.exports = authMiddleware;
