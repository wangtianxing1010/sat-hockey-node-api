import express from 'express';
import Event from '../models/Event';
import parseErrors from '../../utils/parseErrors';
import {authenticate, protectedRoute} from './auth';

const router = express.Router();

// create new event
// todo protected route
router.post('/', [authenticate, protectedRoute], (req, res)=>{
    const organizer = req.user;
    const {eventName} = req.body.event;
    console.log(req.body);
    // const organizer = organizer; get organizer from authorization middleware
    const newEvent = new Event({eventName, organizer:organizer.id}) // id not _id, because id is the one encrypted in token
    console.log('creating new event');
    newEvent.save()
        .then( newEvent =>{
            res.status(200).json({ event: newEvent })
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({ errors: parseErrors(err.errors) })
        })
});

// fetch events
// if no specific host (Homepage)
    // if authenticated return all events (Homepage)
    // if not authenticated (Homepage)
// if authenticated && specific host return host's events only (Dashboard, User's Profile)
// if not authenticated && specific host (not allowed)
router.get('/', (req, res)=>{
    console.log('fetching events');
    console.log('backend', req);
    // let queryPromise;
    // switch(organizer){
    //     case 'dashboardUser':
    //         if (req.authenticate) {
    //             const organizerId = req.user.id;            
    //             queryPromise = Event.find({organizer:organizerId});                    
    //         } else {
    //             protectedRoute(req, res, next);
    //         }
    //     case 'profileUser':
    //         if (req.authenticate) {
    //             const organizerId = req.params.organizer.id;            
    //             queryPromise = Event.find({organizer:organizerId});                    
    //         } else {
    //             protectedRoute(req, res, next);
    //         }    
    //     default:
    //         queryPromise = Event.find();
    // }
    //  // {organizer: organizer.id} fetching all events data, add pagination in the future
    // queryPromise.then(events =>{
    //     events ?
    //     res.status(200).json({ events }) :
    //     res.status(400).json({ errors: parseErrors(err.errors) })
    // })
});

export default router;
