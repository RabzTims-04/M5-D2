import express from "express"
import fs from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import uniqid from 'uniqid'

const authorsRouter = express.Router()
const currentFilePath = fileURLToPath(import.meta.url)
const currentFolderPath = dirname(currentFilePath)
const authorsJSONPath = join(currentFolderPath, "authors.json")

/* GET array of Authors */
authorsRouter.get("/", (req,res)=>{
  
    res.send(JSON.parse(fs.readFileSync(authorsJSONPath)))

})

/* GET single Author's details */
authorsRouter.get("/:id", (req,res)=>{

    const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
    const author = authors.find(author => author._id === req.params.id)
    res.send(author)

})

/* POST Author's details */
authorsRouter.post("/", (req,res)=>{

    /* const authors = authors() */ 
    const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
    let authorsAvatar = `https://ui-avatars.com/api/?name=${req.body.name}+${req.body.surname}`
    const newAuthor = {
        ...req.body,
        avatar: authorsAvatar,  
        _id:uniqid(),       
        createdAt: new Date()
    }

    const { email } = req.body;
    const emailExits = authors.find(author => author.email === email)
    
    if(emailExits){
        return res.status(400).json({error:'Author already exits with this email'})
    }
    else{
        authors.push(newAuthor)
        fs.writeFileSync(authorsJSONPath, JSON.stringify(authors))
        res.status(201).send(newAuthor)
    }

})

/* PUT Modify Author's details  */
authorsRouter.put("/:id", (req,res)=>{

    const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
    const remainingAuthors = authors.filter(author => author._id !== req.params.id)
    const modifiedAuthor = {
        ...req.body,
        _id:req.params.id,
        updatedAt: new Date()
    }
    remainingAuthors.push(modifiedAuthor)
    fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors))
    res.send(modifiedAuthor)

})

/* DELETE Author's details */
authorsRouter.delete("/:id", (req,res)=>{

    const authors = JSON.parse(fs.readFileSync(authorsJSONPath))
    const remainingAuthors = authors.filter(author => author._id !== req.params.id)
    fs.writeFileSync(authorsJSONPath, JSON.stringify(remainingAuthors))
    res.status(204).send(`Author with id: ${req.params.id} is Deleted`)

})

export default authorsRouter