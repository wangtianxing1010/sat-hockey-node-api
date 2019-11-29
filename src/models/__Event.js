import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
        // basic info 
        // eventName: { type: String, required: true },
        // maxAllowed: { type: Number, default: 0},
        // admission: { type: Number, default: 0 },
        tags: {type:[String]}, 

        // organizer view only
        // participants: [{
            // participantId:{type: mongoose.Schema.Types.ObjectId, required: true},
            // paid: {type: Boolean, default: false},
        // }],
        
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

schema.methods.isPast = function isPast(){
    // 0 upcoming
    // 1 past
    return this.datetime > Date.now() ? 1 : 0;
}

schema.methods.toggleIsPaid = function toggleIsPaid(participantId){
    let isPaid = this.participants.id(participantId).paid;
    isPaid ? this.participants.id(participantId).paid = false 
                    : this.participants.id(participantId).paid = true;
    return this.participants.id(participantId).paid
}

schema.methods.addParticipant = function addParticipant(participantId){
    this.participants.push({participantId});
    return this.participants.id(participantId).paid
}

export default mongoose.model("__Event", schema);