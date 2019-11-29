import express from 'express';
import Event from '../models/Event';
import parseErrors from '../../utils/parseErrors';
import {authenticate} from './auth';

const router = express.Router();

// create new event
router.post('/', authenticate, (req, res)=>{
    const {eventName} = req.body.event;
    // const organizer = organizer; get organizer from authorization middleware
    const newEvent = new Event({eventName}) //, organizer}
    console.log('responding');
    newEvent.save()
        .then( newEvent =>{
            res.status(200).json({ event: newEvent })
        })
        .catch(err=>{
            res.status(400).json({ errors: parseErrors(err.errors) })
        })
});

// fetch events
router.get('/', (req, res)=>{
    // const {organizer} = req.body.organizer;
    console.log('responding');
    console.log(req.body);
    Event.find() // {organizer: organizer._id} fetching all events data, add pagination in the future
        .then( events =>{
            res.status(200).json({ events })
        })
        .catch(err=>{
            res.status(400).json({ errors: parseErrors(err.errors) })
        })
});

export default router;
