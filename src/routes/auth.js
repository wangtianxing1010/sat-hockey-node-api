import express from 'express';
import User from '../models/User';
import parseErrors from '../../utils/parseErrors';
import { sendResetPasswordEmail } from '../mailer.js';
import jwt from 'jsonwebtoken';

const router = express.Router();


// user token authentication
export const authenticate = (req, res, next) =>{
    const {token} = req.headers;
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded)=>{
        // expired or wrong token
        if (err) res.status(401).json({ errors: { global: "Invalid token" }}).redirect('/login')
        else if(decoded){
            User.findOne({ email: decoded.email })
            .then(user=>{
                // token matches, pass down user object 
                if(user.authenticationToken===token) next();
                // token is not the latest 
                else res.status(401).json({ errors: { global: "Invalid token" }}).redirect('/login');
            })
            // user not found
            .catch(err=>res.status(500).json({errors: parseErrors(err.errors)}))
        }
    });
}

//login user
router.post('/', authenticate, (req, res) => {
    const { credentials } = req.body;
    User.findOne({ email: credentials.email }).then(user =>{
        if(user && user.isValidPassword(credentials.password)){
            const token = user.setAuthenticationToken()
            res.json({ success: true, user: user.toAuthJSON(), token:token })
        }else{
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
                //do nothing I would
                res.json({ msg: "I do nothing"})
            }
        })
        // what could be server error??
        .catch(err=>
            res.status(400).json({errors: parseErrors(err.errors)})
        );
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
        })
        .catch(err=>res.status(400).json({ errors: err }));
});

export default router;