const User = require("../models/user.model.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const RegisterUser = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "All Fields Are Requires ! [ firstname, lastname, email, username, password]",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email Already Exist !" });
    }

    const user = new User({ firstname, lastname, email, password });
    await user.save();

    res
      .status(201)
      .json({ success: true, message: "User created succesfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};

const LoginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields Are Requires ! [email, password]",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: true, message: "Invalid Email OR Passsword" });
    }

    const payload = {
      id: user._id,
      firstname: user.firstname,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "12hr",
    });

    res
      .status(201)
      .json({ success: true, message: "Login Succesfully", token, user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server error !" });
  }
};


module.exports = {
  RegisterUser,
  LoginUser,
};
