import { body } from "express-validator";

export const blogsValidation = [
    body("category").exists().withMessage("category is mandatory").isString().withMessage("category should be a string"),
    body("title").exists().withMessage("Title is mandatory").isString().withMessage("title should be a string"),
    body("cover").exists().withMessage("Image link is mandatory").isURL().withMessage("it should be a URL"),
    body("content").exists().withMessage("content is mandatory"),
    /* body("readTime").exists().withMessage("readTime should be mandatory").isObject().withMessage("RealTime should be an object"),
    body("readTime.value").exists().withMessage("value should be a property of readTime").isInt().withMessage("value should be an integer"),
    body("readTime.unit").exists().withMessage("unit should be a property of readTime").isString().withMessage("unit should be a string"), */
    body("author").exists().withMessage("author is mandatory").isObject().withMessage("author should be an object"),
    body("author.name").exists().withMessage("name should be a property of author").isString().withMessage("name should be a string"),
    body("author.avatar").exists().withMessage("avatar should be a property of author").isURL().withMessage("avatar should be a url")
   
]

export const blogsCommentsValidation =[
    body("author").exists().withMessage('author name is mandatory').isString().withMessage("Author name should be a string"),
    body("text").exists().withMessage('text Field is mandatory')
]