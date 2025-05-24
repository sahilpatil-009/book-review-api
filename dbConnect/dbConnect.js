const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connect");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDb; 