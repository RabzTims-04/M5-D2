import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from 'cors'
import usersRouter from './services/users/index.js'
import authorsRouter from './services/authors/index.js'
import blogsRouter from './services/blogs/index.js'
import { catchAllErrors, badRequestMiddleware, notFoundMiddleWare } from "./errorMiddlewares.js"

const server = express()
const port = 3001

/* ************MIDDLEWARES***************** */

server.use(cors())
server.use(express.json())

/* ************ENDPOINTS******************* */

server.use("/users",usersRouter)
server.use("/authors",authorsRouter)
server.use("/blogs",blogsRouter)

/* ***********ERROR MIDDLEWARES************ */

server.use(notFoundMiddleWare)
server.use(badRequestMiddleware)
server.use(catchAllErrors)

console.table(listEndpoints(server));
server.listen(port,()=>{
    console.log("server is running on port " + port);
})

