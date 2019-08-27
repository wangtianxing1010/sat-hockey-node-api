import express from 'express';

const router = express.Router();

router.get("/search", (req, res)=>{
    res.json({
        books: [
            {},
            {}
        ]
    })
})

export default router;