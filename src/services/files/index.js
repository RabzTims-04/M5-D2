import express from "express"
import multer from "multer"
import createError from 'http-errors'
import { writeUsersPicture } from "../../lib/fs-tools.js"

const filesRouter = express.Router()

filesRouter.post("/upload", multer({fileFilter:(req, file, next)=>{
    if(file.mimetype !== "image/gif"){
        return next(createError(400, "only gif allowed"))
    }else{
        return next(null, true)
    }
},
}).single('profilePic'), async (req, res, next)=>{
    try {
        console.log(req.file);
        await writeUsersPicture(req.file.originalname, req.file.buffer)
        res.send("image uploaded")
    } catch (error) {
        next(error)
    }
})

filesRouter.post("/uploadMultiple", multer().array('profilePic',2), async (req, res, next)=>{
    try {
        console.log('REQ. FILES', req.files);
        const arrayOfPromises = req.files.map(file =>  writeUsersPicture(file.originalname, file.buffer))
        await Promise.all(arrayOfPromises)
        res.send("image uploaded")
    } catch (error) {
        next(error)
    }
})

export default filesRouter