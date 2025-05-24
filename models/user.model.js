const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required:true
    },
    lastname: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password: {
        type:String,
        required:true
    }

}, {timestamps : true});

//hash password befor saving
UserSchema.pre('save', async function name(next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

// compare password
UserSchema.methods.comparePassword = async function(userPassword) {
    return bcrypt.compare(userPassword, this.password);
};

// remove password from json output
UserSchema.method.toJSON = function(){
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model("User", UserSchema);