import express from 'express';
import Event from '../models/Event';

const router = express.Router();

router.post("/new_event/", (req, res)=>{
    const { 
        eventName, maxAllowed, admission, tags,
        datetime, year, month, date, weekday,
        hour, min, timezone,
        streetNo, street, city, room, postCode,
     } = req.body.data;

    const event = new Event({ 
        // basic info 
        eventName, maxAllowed, admission, tags,
        // time
        datetime, year, month, date, weekday,
        hour, min, timezone,
        // location
        streetNo, street, city, room, postCode,
     });

     // add to database
     event
        .save()
        .then(eventReturned=> {
            res.json({ event: eventReturned });
            console.log('node-api/src/routes/events.js', res);
        })
        .catch(err=> res.status(400).json({ errors: err }));
})        

export default router;