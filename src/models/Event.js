import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
    eventName: { type: String, required: true, lowercase: true, 
        index: true, unique: true },
    // maxAllowed: { type: Number, default: 0 },
    // admission: { type: Number, default: 0 },
    organizer: { type: mongoose.Schema.Types.ObjectId, required: true },
    }, 
    { timestamps: true }
);

schema.plugin(uniqueValidator, { message: "expected to be unique"})

export default mongoose.model("Event", schema);