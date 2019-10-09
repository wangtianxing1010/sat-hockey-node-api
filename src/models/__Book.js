import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    book: { type: String, required: true, lowercase: true, index: true },
    }, 
    { timestamps: true }
);


export default mongoose.model("Book", schema);