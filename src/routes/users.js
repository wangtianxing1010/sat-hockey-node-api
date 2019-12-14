import express from 'express';
import User from '../models/User';
import parseErrors from '../../utils/parseErrors';
import { sendConfirmationEmail } from '../mailer.js';
import {authenticate} from './auth';

const router = express.Router();

// create user
router.post('/', (req, res)=>{
    const { email, password } = req.body.user;
    const user = new User({ email })
    user.setPassword( password );
    user.setConfirmationToken();
    console.log('confirmToken',user.confirmationToken)
    user
        .save()
        .then(userReturned=> {
            res.json({ user: userReturned.toAuthJSON() });
            console.log('node-api/src/routes/users.js', res.body.user.email);
            sendConfirmationEmail(userReturned);
        })
        .catch(err=> res.status(400).json({ errors: parseErrors(err.errors) }));
})

// confirm user's account
router.post('/confirmation', (req, res)=>{
    const {token} = req.body;
    console.log(token);
    User.findOneAndUpdate(
        { confirmationToken: token },
        { confirmationToken: '', confirmed: true},
        { new: true } // mark it true to get an updated user object
    ).then(user=>
        user ? 
        res.json({user: user.toAuthJSON()}) : 
        res.status(400).json({errors: { global: "Invalid Token" }})
    );
})

// todo 
// router.post('/resend_confirmation_email', authenticate, (req, res)=>{
//     const { user } = authenticate;
//          if (user.confirmed) return res.redirect('/dashboard')
//     sendConfirmationEmail(userReturned);
// })

export default router;