import express from 'express'
import uniqid from 'uniqid'
import createError from "http-errors"
import multer from "multer"
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import axios from 'axios'
import {extname} from "path"
import { writeBlogsPicture, writeAuthorsPicture } from '../../lib/fs-tools.js'
import { validationResult } from 'express-validator'
import { blogsValidation, blogsCommentsValidation } from './validation.js'
import { getBlogs, writeBlogs } from "../../lib/fs-tools.js"
import { generatePDFReadableStream } from "../../lib/pdf/index.js"
import { pipeline } from 'stream'
import striptags from 'striptags'

const blogsRouter = express.Router()


/* GET PDF files */
blogsRouter.get("/:id/PDFDownload", async (req, res, next) =>{
    try {
        const blogs = await getBlogs()
        const blog = blogs.find(blog => blog._id === req.params.id)
        res.setHeader("Content-Disposition","attachment; filename = blog.pdf")
        if(blog){
            const content = striptags(blog.content)
            const response = await axios.get(blog.cover,
                {responseType:'arraybuffer'}
                )
            const blogCoverURLParts =  blog.cover.split('/')
            const fileName = blogCoverURLParts[blogCoverURLParts.length-1]
            const [id, extension] = fileName.split('.')
            const base64 = Buffer.from(response.data).toString('base64')
           /*  const base64 = response.data.toString("base64") */
            const base64Image = `data:image/${extension};base64,${base64}`

            const source = await generatePDFReadableStream(blog.author, base64Image, blog.title,content)
            const destination = res
            pipeline(source, destination, err => {
                if(err){
                    next(err)
                }
            })
        }   
    } catch (error) {
        console.log(error);
        next(error)
    }
})

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

/* GET single blog comments */
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

/* GET single blog sinle comment */
blogsRouter.get('/:id/comments/:commentId',async (req,res, next)=>{

    try {
        const blogs = await getBlogs()
        const blog = blogs.find(blog => blog._id === req.params.id)
        if(blog){
            const blogComments = blog.comments
            if(blogComments){
                const blogSingleComment = blogComments.find(comment => comment._id === req.params.commentId)
                res.send(blogSingleComment)
            }           
        }
        else{
            next(createError(404, `Blog with id: ${req.params.id} or Comment with id: ${req.params.commentId} not found`))
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

/* *********************POST Image of product************************* */
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder:"blogs"
    }
})

const uploadOnCloudinary = multer({ storage: cloudinaryStorage}).single("cover")

/* POST a cover Image to a specific blog */
 blogsRouter.post('/:id/uploadCover',uploadOnCloudinary,async (req,res, next)=>{

    try { 
        console.log(req.body);
        const newBlog = {cover: req.file.path}
        const url = newBlog.cover
        const blogs = await getBlogs()
        const blog = blogs.find(blog => blog._id === req.params.id)
        if(blog){
            blog.cover = url
            await writeBlogs(blogs)
        }
        /* const fileName = req.file.originalname.slice(-4)
        const newFileName = req.params.id.concat(fileName)
        const url = `https://m5-blogpost.herokuapp.com/img/blogs/${req.params.id}${extname(req.file.originalname)}`
        console.log(newFileName);
        await writeBlogsPicture(newFileName, req.file.buffer)
        console.log(req.file.buffer);
        console.log(url);
        const blogs = await getBlogs()
        const blog = blogs.find(blog => blog._id === req.params.id)
        if(blog){
            blog.cover = url
            await writeBlogs(blogs)
        }
        */ 
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
        const url = `https://m5-blogpost.herokuapp.com/img/avatar/${req.params.id}${extname(req.file.originalname)}`
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

/* PUT a comment to a specific blog */
blogsRouter.put('/:id/comments/:commentId',blogsCommentsValidation,async (req,res, next)=>{
    
    try {
            const blogs = await getBlogs()
            const blogIndex = blogs.findIndex(blog=> blog._id === req.params.id)
            console.log("index", blogIndex);
            if(blogIndex !== -1){
                let blog = blogs[blogIndex]
                let blogComments = blog.comments
                console.log('blogComments',blogComments);
                let blogCommentIndex = blogComments.findIndex(comment => comment._id === req.params.commentId)
                console.log('blogCommentIndex', blogCommentIndex);
                let editComment = blogComments[blogCommentIndex]
                console.log('editComment', editComment);
                console.log('commentbody', req.body);
                editComment ={
                    ...editComment,
                    ...req.body,
                    _id:req.params.commentId,
                    updatedAt: new Date()
                }
                console.log('editComment', editComment);
                
                blogComments[blogCommentIndex] = editComment
                await writeBlogs(blogs)
                res.send(blog) 
            }
            else{
                next(createError(400, {errorsList: "error"}))
            }        
    }catch (error) {
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

/* DELETE a blog comment */
blogsRouter.delete('/:id/comments/:commentId',async (req,res, next)=>{

    try {
        const blogs = await getBlogs()
        const blog = blogs.find(blog => blog._id === req.params.id)
        if(blog){
            const blogComments = blog.comments
            const deleteComment = blogComments.findIndex(comment => comment._id === req.params.commentId)
            res.send(blogComments[deleteComment])
            blogComments.splice(deleteComment,1)
            await writeBlogs(blogs)
            res.status(200)      
        }
    } catch (error) {
        next(error)
    }
})

export default blogsRouter