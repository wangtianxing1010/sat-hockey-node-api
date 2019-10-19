import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const schema = new mongoose.Schema({
    book: { type: String, required: true, lowercase: true, 
        index: true, unique: true },
    }, 
    { timestamps: true }
);

schema.plugin(uniqueValidator, { message: "expected to be unique"})

export default mongoose.model("Book", schema);