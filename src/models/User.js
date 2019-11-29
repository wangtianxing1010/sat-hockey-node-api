import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
    username: { type: String, index: true, unique: true },
    email: { type: String, required: true, lowercase: true, index: true, unique: true },
    passwordHash: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: '' },
    resetPasswordToken: { type: String, default: '' },
    authenticationToken: { type: String, default: '' },
    }, 
    { timestamps: true }
);

schema.methods.setPassword = function setPassword(password){
    this.passwordHash = bcrypt.hashSync(password, 10);
}

schema.methods.isValidPassword = function isValidPassword(password){
    return bcrypt.compareSync(password, this.passwordHash);
}

// obtain user object
schema.methods.toAuthJSON = function toAuthJSON(){
    return {
        email: this.email,
        token: this.setAuthenticationToken(),
        confirmed: this.confirmed
    }
}

const generateJWT = (payload, expiresIn=null) => {
    return jwt.sign(payload, process.env.SECRET_KEY, expiresIn); 
}

// User authentication token
schema.methods.setAuthenticationToken = function setAuthenticationToken(){
    this.authenticationToken = generateJWT(
        {email: this.email, },
        process.env.SECRET_KEY,
        {expiresIn: '15d'}
    );
    return this.authenticationToken
}

// User confirmation
schema.methods.setConfirmationToken = function setConfirmationToken(){
    this.confrimationToken = generateJWT(
        {email: this.email, confirmed: this.confirmed,},
        process.env.SECRET_KEY,
        {expiresIn: '1d'}
    )
}

schema.methods.generateConfirmationUrl = function generateConfirmationUrl(){
    return `${process.env.HOST}/confirmation/${this.confrimationToken}`
}

// Reset Password
schema.methods.setResetPasswordToken = function setResetPasswordToken(){
    this.resetPasswordToken = generateJWT(
        { id: this._id, }, 
        process.env.SECRET_KEY,
        {expiresIn: '1h'}
    ); 
    return this.resetPasswordToken
}

schema.methods.generateResetPasswordUrl = function generateResetPasswordUrl(){
    return `${process.env.HOST}/reset_password/${this.setResetPasswordToken()}`
}

schema.plugin(uniqueValidator, { message: "this email is already taken"});

export default mongoose.model("User", schema);