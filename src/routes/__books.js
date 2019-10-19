import express from 'express';
import Book from '../models/__Book';
import parseErrors from '../../utils/parseErrors';



const router = express.Router();

router.post('/', (req, res)=>{
    const {book} = req.body.book;
    const newbook = new Book({book})
    console.log('responding');
    newbook.save()
        .then( newbook =>{
            res.status(200).json({ book: newbook })
        })
        .catch(err=>{
            res.status(400).json({ errors: parseErrors(err.errors) })
        })
});

router.get('/', (req, res)=>{
    console.log('responding');
    Book.find()
        .then( events =>{
            res.status(200).json({ events })
        })
        .catch(err=>{
            res.status(400).json({ errors: parseErrors(err.errors) })
        })
});

export default router;
