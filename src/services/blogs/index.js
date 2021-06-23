import express from 'express'
import fs from "fs"
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import uniqid from 'uniqid'
import createError from "http-errors"
import { validationResult } from 'express-validator'
import {blogsValidation} from './validation.js'

const blogsRouter = express.Router()
const blogsJsonPath = join(dirname(fileURLToPath(import.meta.url)),"blogs.json")

const getBlogsArray = ()=>{
    const content = fs.readFileSync(blogsJsonPath)
    return JSON.parse(content)
}

const writeBlogs = (content) =>{
    return fs.writeFileSync(blogsJsonPath, JSON.stringify(content))
}

/* GET All blogs */
blogsRouter.get("/",(req,res, next)=>{

    try { 
        const blogs = getBlogsArray()
        res.send(blogs)  
    } catch (error) {
        next(error)
    }    
})

/* GET single blog */
blogsRouter.get('/:id',(req,res, next)=>{

    try {
        const blogs = getBlogsArray()
        const blog = blogs.find(blog => blog._id === req.params.id)
        if(blog){
            res.send(blog)
        }
        else{
            next(createError(404, `Blog with id: ${req.params.id} not found`))
        }        
    } catch (error) {
        next(error)
    }
})

/* POST a blog */
blogsRouter.post('/',blogsValidation,(req,res, next)=>{

    try {
        const errors = validationResult(req)

        if(errors.isEmpty()){
            const newBlog = {...req.body, _id: uniqid(), createdAt: new Date()}
            const blogs = getBlogsArray()
            blogs.push(newBlog)
            writeBlogs(blogs)
            res.status(201).send({_id: newBlog._id})
        }
        else{
            next(createError(400, {errorsList: errors}))
        }
        
    } catch (error) {
        next(error)
    }
})

/* PUT a blog */
blogsRouter.put('/:id',blogsValidation,(req,res, next)=>{

    try {
            const blogs = getBlogsArray()
            const remainingBlogs = blogs.filter(blog => blog._id !== req.params.id)
            const blog = blogs.find(blog => blog._id === req.params.id)
            const modifiedBlog = {
                ...blog,
                ...req.body,
                _id:req.params.id,
                updatedAt: new Date()
            }
            remainingBlogs.push(modifiedBlog)
            writeBlogs(remainingBlogs)
            res.send(modifiedBlog)            
            next(createError(400, {errorsList: "error"}))
      
    } catch (error) {
        next(error)
    }   
})

/* DELETE a blog */
blogsRouter.delete('/:id',(req,res, next)=>{

    try {
        const blogs = getBlogsArray()
        const remainingBlogs = blogs.filter(blog => blog._id !== req.params.id) 
        writeBlogs(remainingBlogs)
        res.status(200).send(`blog with id: ${req.params.id} Deleted successfully!!`)        
    } catch (error) {
        next(error)
    }
})

export default blogsRouter