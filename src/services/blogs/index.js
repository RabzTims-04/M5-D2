import express from 'express'
import uniqid from 'uniqid'
import createError from "http-errors"
import multer from "multer"
import {extname} from "path"
import { writeBlogsPicture, writeAuthorsPicture } from '../../lib/fs-tools.js'
import { validationResult } from 'express-validator'
import { blogsValidation, blogsCommentsValidation } from './validation.js'
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

/* GET single blog comment */
blogsRouter.get('/:id/comments',async (req,res, next)=>{

    try {
        const blogs = await getBlogs()
        const blog = blogs.find(blog => blog._id === req.params.id)
        if(blog){
            const blogComment = blog.comments
            res.send(blogComment)
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
            const newBlog = {...req.body, _id: uniqid(), createdAt: new Date(), comments:[]}
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

/* POST a comment to a specific blog */
 blogsRouter.post('/:id/comments',blogsCommentsValidation,async (req,res, next)=>{

    try {
        const errors = validationResult(req)

        if(errors.isEmpty()){
            const blogs = await getBlogs()
            const blog = blogs.find(blog => blog._id === req.params.id)
            if(blog){
                const blogComment = blog.comments
                const newComment = {...req.body, _id: uniqid(), createdAt: new Date()}
                blogComment.push(newComment)
                await writeBlogs(blogs)
                res.status(201).send({_id: newComment._id})
            }
        }
        else{
            next(createError(400, {errorsList: errors}))
        }
        
    } catch (error) {
        next(error)
    }
})

/* POST a cover Image to a specific blog */
 blogsRouter.post('/:id/uploadCover',multer().single("cover"),async (req,res, next)=>{

    try { 
        console.log(req.body);
        const fileName = req.file.originalname.slice(-4)
        const newFileName = req.params.id.concat(fileName)
        const url = `http://localhost:3001/img/blogs/${req.params.id}${extname(req.file.originalname)}`
        console.log(newFileName);
        await writeBlogsPicture(newFileName, req.file.buffer)
        console.log(url);
        const blogs = await getBlogs()
        const blog = blogs.find(blog => blog._id === req.params.id)
        if(blog){
            blog.cover = url
            await writeBlogs(blogs)
        }
        res.send(blog.cover)      
        
    } catch (error) {
        next(error)
    }
})

/* POST a Profile Picture of author of a specific blog */
blogsRouter.post('/:id/uploadAvatar',multer().single("avatar"),async (req,res, next)=>{

    try { 
        console.log(req.body);
        const fileName = req.file.originalname.slice(-4)
        const newFileName = req.params.id.concat(fileName)
        const url = `http://localhost:3001/img/avatar/${req.params.id}${extname(req.file.originalname)}`
        console.log(newFileName);
        await writeAuthorsPicture(newFileName, req.file.buffer)
        console.log(url);
        const blogs = await getBlogs()
        const blog = blogs.find(blog => blog._id === req.params.id)
        if(blog){
            blog.author.avatar = url
            await writeBlogs(blogs)
        }
        res.send(blog.author.avatar)      
        
    } catch (error) {
        next(error)
    }
})

/* PUT a blog */
blogsRouter.put('/:id',blogsValidation,async (req,res, next)=>{

    try {
            const blogs = await getBlogs()
            const blogIndex = blogs.findIndex(blog=> blog._id === req.params.id)
            console.log("index", blogIndex);
            if(blogIndex !== -1){
                let blog = blogs[blogIndex]

                blog={
                    ...blog,
                    ...req.body,
                     _id:req.params.id,
                    updatedAt: new Date()
                }
                console.log("blog", blog);
                blogs[blogIndex] = blog
                console.log('BLOGS', blogs);
            await writeBlogs(blogs)
            res.send(blog) 
            }else{
                next(createError(400, {errorsList: "error"}))
            }
          /*   const remainingBlogs = blogs.filter(blog => blog._id !== req.params.id)
             const blog = blogs.find(blog => blog._id === req.params.id) 
            const modifiedBlog = {
                ...blog,
                ...req.body,
                _id:req.params.id,
                updatedAt: new Date()
            } */
            /* remainingBlogs.push(modifiedBlog) */
                       
           
      
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