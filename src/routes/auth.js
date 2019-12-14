import express from 'express';
import User from '../models/User';
import parseErrors from '../../utils/parseErrors';
import { sendResetPasswordEmail } from '../mailer.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// middlewares
// user token authentication
export const authenticate = (req, res, next) =>{
    const header = req.headers.authorization;
    console.log('is authenticating');
    console.log(header);
    if (header) {
        const token = header.split(' ')[1];
        if (token) {
            console.log('token exists', token);
            jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
                // expired or wrong token
                if (err) {
                    console.log('expired or wrong token', token);
                    req.authenticated = false;
                    //.redirect('/login')
                    req.error = { status: 401, msg: { errors: { global: "Invalid token" }} };
                    next();
                } else if(decoded){
                    const index = decoded.email;
                    if(!index) res.status(500).json({ errors: {global: "wrong index"} })
                    User.findOne({ email: index })
                    .then(user=>{
                        // user not found
                        if(!user){
                            console.log('user not found', token);
                            req.authenticated = false;
                            res.status(500).json({errors: parseErrors(err.errors)})
                            next();    
                        }
                        // token matches, pass down user object 
                        else if(user.authToken===token) {
                            console.log('token matches, pass down user object', token);
                            req.authenticated = true;
                            req.user = decoded;
                            next();
                        }
                        // token is not the latest 
                        else {
                            console.log('token is not the latest', token);
                            console.log('token in database', user.authToken);
                            req.authenticated = false;
                            //.redirect('/login');
                            req.error = { status: 401, msg: { errors: { global: "Invalid token" }} }
                            next();
                        }})
                }
            });
        }
    }
    // no header
    else {
        console.log('No header, no token');
        req.authenticated = false;
        req.error = { status: 401, msg: { errors: { global: "No token" }} };
        next();
    }
}

export const protectedRoute = (req, res, next) => {
    // if logged in, go next()
    if (req.authenticated) {
        console.log('user authenticated');
        next();
    }
    // if not logged in return error
    else {
        // expired or wrong token
        res.status(req.error.status).json(req.error.msg);
    }
}

export const loggedInAlready = (req, res, next) =>{
    // if logged in already, redirect
    if (req.authenticated) {
        console.log('already loggedin');
        res.json({ success: true, user: req.user })
    }
    // if not logged in, go next()
    else {
        console.log('not yet loggedin');
        next();
    };
};

// if header && correct token redirect to dashboard
// if header && wrong token continue login process
// if no header, continue login process
//login user
router.post('/', [authenticate, loggedInAlready], (req, res) => {
    const { credentials } = req.body;
    console.log(req.authenticated);
    console.log(req.user);
    console.log(req.error);
    User.findOne({ email: credentials.email }).then(user =>{
        if(user && user.isValidPassword(credentials.password)){
            user.setAuthToken();
            user.save(); // important or changes won't be saved
            res.json({ success: true, user: user.toAuthJSON() })
        }else{
            // user not found
            res.status(400).json({ errors: { global: "Invalid Credentials" } });
        }
    });
});

// Reset password
router.post('/reset_password_request', (req, res)=>{
    const {data} = req.body;
    User.findOne({ email: data.email }).then(userReturned=>{
            if (userReturned){
                sendResetPasswordEmail(userReturned);
                res.json({ msg: "Email sent, please check your inbox "})
            }else{
                // user not found
                res.status(400).json({errors: parseErrors(err.errors)})
            }
        })
});

// token validation for reset password
router.post('/validate_reset_password_token', (req, res)=>{
    const { token } = req.body;
    jwt.verify(token, process.env.SECRET_KEY, (err)=>{
        if(err){
            res.status(401).json({});
        }else{
            res.status(200).json({});
        }
    })
});

// reset password
router.post('/reset_password', (req, res)=>{
    const { token, password } = req.body.data;
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
        if(err){
            res.status(401).json({ errors: { global: "Invalid token" }})
        }else{
            User.findOne({ _id: decoded.id }).then(user=>{
                if(user && token === user.resetPasswordToken){
                    user.setPassword(password);
                    user.resetPasswordToken = '';
                    user.save().then(()=>res.status(200).json({ok:'ok'}));
                }else{
                    res.status(404).json({ errors: {global: `No user found, ${decoded}`}})
                }
            })
        }
    })
    User.findOne({ email: token })
        .then(userReturned=>{
            if (userReturned) {
                userReturned.setPassword(password);
                res.json({ user: userReturned.toAuthJSON() });
            }
            else {
                res.status(400).json({errors: parseErrors(err.errors)})
            }
        })
});

export default router;