import express from 'express'
import fs from "fs"
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import uniqid from 'uniqid'

const usersRouter = express.Router()

const currentFilePath = fileURLToPath(import.meta.url)

const currentFolderPath = dirname(currentFilePath)

const usersJSONPath = join(currentFolderPath, "users.json")

usersRouter.get("/",(req,res)=>{
    
    const usersJSONContent = fs.readFileSync(usersJSONPath)
    const contentASJSON = JSON.parse(usersJSONContent)
    res.send(contentASJSON)
  
})
usersRouter.get('/:id',(req,res)=>{

    res.send("Hello I'm the get single user endpoint")
})
usersRouter.post('/',(req,res)=>{
 
    const newUser = {...req.body, _id: uniqid(), createdAt: new Date()}
    const users = JSON.parse(fs.readFileSync(usersJSONPath))
    users.push(newUser)
    fs.writeFileSync(usersJSONPath,JSON.stringify(users))
    res.status(201).send({_id: newUser._id})

})
usersRouter.put('/:id',(req,res)=>{
   
    res.send("Hello I'm the put single user endpoint")
})
usersRouter.delete('/:id',(req,res)=>{

    res.send("Hello I'm the delete single user endpoint")
})

export default usersRouter