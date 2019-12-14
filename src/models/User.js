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
    authToken: { type: String, default: '' },
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
    const userJSON = {
        email: this.email,
        username: this.username,
        token: this.authToken,
        confirmed: this.confirmed
    }
    return userJSON
}

const generateJWT = (payload, expiresIn=null) => {
    return jwt.sign(payload, process.env.SECRET_KEY, expiresIn); 
}

// User authentication token
schema.methods.setAuthToken = function setAuthToken(){
    this.authToken = generateJWT(
        { id: this._id, 
            ///
            email: this.email,
            confirmed: this.confirmed,
            username: this.username,
        },
        {expiresIn: '15d'}
    );
    return this.authToken;
}

// User confirmation
schema.methods.setConfirmationToken = function setConfirmationToken(){
    this.confirmationToken = generateJWT(
        {email: this.email, confirmed: this.confirmed,},
        {expiresIn: '1d'}
    );
}

schema.methods.generateConfirmationUrl = function generateConfirmationUrl(){
    return `${process.env.HOST}/confirmation/${this.confrimationToken}`
}

// Reset Password
schema.methods.setResetPasswordToken = function setResetPasswordToken(){
    this.resetPasswordToken = generateJWT(
        { id: this._id, }, 
        {expiresIn: '1h'}
    ); 
    return this.resetPasswordToken
}

schema.methods.generateResetPasswordUrl = function generateResetPasswordUrl(){
    return `${process.env.HOST}/reset_password/${this.setResetPasswordToken()}`
}

schema.plugin(uniqueValidator, { message: "this email is already taken"});

export default mongoose.model("User", schema);