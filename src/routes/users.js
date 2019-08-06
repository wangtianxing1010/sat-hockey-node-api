import express from 'express';
import User from '../models/User';
import parseErrors from '../../utils/parseErrors';
import { sendConfirmationEmail } from '../mailer.js';

const router = express.Router();

router.post('/', (req, res)=>{
    const { email, password } = req.body.user;
    const user = new User({ email })
    user.setPassword( password );
    user.setConfirmationToken();
    user
        .save()
        .then(userReturned=> {
            res.json({ user: userReturned.toAuthJSON() });
            console.log('node-api/src/routes/users.js', res);
            sendConfirmationEmail(userReturned);
        })
        .catch(err=> res.status(400).json({ errors: parseErrors(err.errors) }));
})


export default router;