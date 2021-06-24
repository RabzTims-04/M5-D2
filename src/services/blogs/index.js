import express from 'express'
import uniqid from 'uniqid'
import createError from "http-errors"
import { validationResult } from 'express-validator'
import { blogsValidation } from './validation.js'
import { getBlogs, writeBlogs } from "../../lib/fs-tools.js"

const blogsRouter = express.Router()

/* GET All blogs */
blogsRouter.get("/",async (req,res, next)=>{

    try { 
        const blogs = await getBlogs()
        res.send(blogs)  
    } catch (error) {
        next(error)
    }    
})

/* GET single blog */
blogsRouter.get('/:id',async (req,res, next)=>{

    try {
        const blogs = await getBlogs()
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
blogsRouter.post('/',blogsValidation,async (req,res, next)=>{

    try {
        const errors = validationResult(req)

        if(errors.isEmpty()){
            const newBlog = {...req.body, _id: uniqid(), createdAt: new Date()}
            const blogs = await getBlogs()
            blogs.push(newBlog)
            await writeBlogs(blogs)
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
blogsRouter.put('/:id',blogsValidation,async (req,res, next)=>{

    try {
            const blogs = await getBlogs()
            const remainingBlogs = blogs.filter(blog => blog._id !== req.params.id)
            const blog = blogs.find(blog => blog._id === req.params.id)
            const modifiedBlog = {
                ...blog,
                ...req.body,
                _id:req.params.id,
                updatedAt: new Date()
            }
            remainingBlogs.push(modifiedBlog)
            await writeBlogs(remainingBlogs)
            res.send(modifiedBlog)            
            next(createError(400, {errorsList: "error"}))
      
    } catch (error) {
        next(error)
    }   
})

/* DELETE a blog */
blogsRouter.delete('/:id',async (req,res, next)=>{

    try {
        const blogs = await getBlogs()
        const remainingBlogs = blogs.filter(blog => blog._id !== req.params.id) 
        await writeBlogs(remainingBlogs)
        res.status(200).send(`blog with id: ${req.params.id} Deleted successfully!!`)        
    } catch (error) {
        next(error)
    }
})

export default blogsRouter