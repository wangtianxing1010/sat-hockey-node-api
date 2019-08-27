import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import uniqueValidator from 'mongoose-unique-validator';

// to do add uniqueness and email validation
const schema = new mongoose.Schema({
    username: { type: String, required: true, index: true, unique: true },
    email: { type: String, required: true, lowercase: true, index: true, unique: true },
    passwordHash: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: '' },
    resetPasswordToken: { type: String, default: '' },
    }, 
    { timestamps: true }
);

schema.methods.setPassword = function setPassword(password){
    this.passwordHash = bcrypt.hashSync(password, 10);
}

schema.methods.isValidPassword = function isValidPassword(password){
    return bcrypt.compareSync(password, this.passwordHash);
}

schema.methods.toAuthJSON = function toAuthJSON(){
    return {
        email: this.email,
        token: this.generateJWT(),
        confirmed: this.confirmed
    }
}

schema.methods.generateJWT = function generateJWT(){
    return jwt.sign({
        email: this.email,
        confirmed: this.confirmed,
    }, process.env.SECRET_KEY); 
}

// User confirmation
schema.methods.setConfirmationToken = function setConfirmationToken(){
    this.confrimationToken = this.generateJWT();
}

schema.methods.generateConfirmationUrl = function generateConfirmationUrl(){
    return `${process.env.HOST}/confirmation/${this.confrimationToken}`
}

// Reset Password
schema.methods.setResetPasswordToken = function setResetPasswordToken(){
    this.resetPasswordToken = jwt.sign({
        id: this._id,
    }, process.env.SECRET_KEY,
    {expiresIn: '1h'}); 
    return this.resetPasswordToken
}

schema.methods.generateResetPasswordUrl = function generateResetPasswordUrl(){
    return `${process.env.HOST}/reset_password/${this.setResetPasswordToken()}`
}

schema.plugin(uniqueValidator, { message: "this email is already taken"});

export default mongoose.model("User", schema);