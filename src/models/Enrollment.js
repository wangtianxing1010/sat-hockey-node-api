import mongoose from 'mongoose';
// import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    participantId:{type: mongoose.Schema.Types.ObjectId, required: true, index:true },
    paid: {type: Boolean, default: false},
    }, 
    { timestamps: true }
);

// schema.plugin(uniqueValidator, { message: "expected to be unique"})

export default mongoose.model("Enrollment", schema);