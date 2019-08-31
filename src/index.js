import express from "express";
import path from "path";
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import auth from './routes/auth';
import users from './routes/users';
import events from './routes/events';

import dotenv from 'dotenv';
import Promise from 'bluebird';

dotenv.config();

const app = express();
app.use(bodyParser.json()); // parse request body
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URL, { useCreateIndex: true , useNewUrlParser: true, useFindAndModify: false });

app.use('/api/auth', auth); 
app.use('/api/users', users);
app.use('/api/events', events);

// app.post('/api/auth', (req, res) => {
//     res.status(400).json({ errors: { global: "Invalid Credentials" } });
// });

app.get("/*", (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(8080, () => console.log("Running on localhost 8080"))
