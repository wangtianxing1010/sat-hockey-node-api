import express from 'express';
import User from '../models/User';
import parseErrors from '../../utils/parseErrors';
import { sendResetPasswordEmail } from '../mailer.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', (req, res) => {
    const { credentials } = req.body;
    User.findOne({ email: credentials.email }).then(user =>{
        if(user && user.isValidPassword(credentials.password)){
            res.json({ success: true, user: user.toAuthJSON() })
        }else{
            res.status(400).json({ errors: { global: "Invalid Credentials" } });
        }
    });
});

router.post('/confirmation', (req, res)=>{
    const {token} = req.body;
    console.log(token);
    User.findOneAndUpdate(
        { confirmationToken: token },
        { confirmationToken: '', confirmed: true},
        { new: true } // mark it true to get an updated user object
    ).then(user=>
        user ? res.json({user: user.toAuthJSON()}) : res.status(400).json({errors: { global: "Invalid Token" }})
    );
})

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