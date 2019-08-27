import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
        eventName: { type: String, required: true },
        maxAllowed: { type: Number, default: 0},
        admission: { type: Number, default: 0 },
        tags: {type:[String]}, 
        // time
        datetime: { type: Date, required: true},
        year: { type: Number, default: 0 },
        month: { type: Number, default: 0},
        date: { type: Number, default: 0},
        weekday: { type: Number, default: 0},
        
        hour: { type: Number, default: 0},
        min: { type: Number, default: 0},
        timezone: {type:String, default: ''}, 
        // location
        streetNo:{ type: Number, required: true},
        street:{ type: String, required: true},
        city:{ type: String, required: true},
        room:{type:Number}, 
        postCode:{type: String, default: ''},
        }, {timestamp: true }
    );

schema.plugin(uniqueValidator, { message: "this email is already taken"});

export default mongoose.model("User", schema);