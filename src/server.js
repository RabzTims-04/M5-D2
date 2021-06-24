import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from 'cors'
import { join } from "path"

import usersRouter from './services/users/index.js'
import authorsRouter from './services/authors/index.js'
import blogsRouter from './services/blogs/index.js'
import filesRouter from './services/files/index.js'

import { catchAllErrors, badRequestMiddleware, notFoundMiddleWare } from "./errorMiddlewares.js"
import { getCurrentFolderPath } from "./lib/fs-tools.js"

const server = express()
const port = 3001
const publicFolderPath = join(getCurrentFolderPath(import.meta.url), "../public")

/* ************MIDDLEWARES***************** */

server.use(express.static(publicFolderPath))
server.use(cors())
server.use(express.json())

/* ************ENDPOINTS******************* */

server.use("/users",usersRouter)
server.use("/authors",authorsRouter)
server.use("/blogs",blogsRouter)
server.use("/files",filesRouter)

/* ***********ERROR MIDDLEWARES************ */

server.use(notFoundMiddleWare)
server.use(badRequestMiddleware)
server.use(catchAllErrors)

console.table(listEndpoints(server));
server.listen(port,()=>{
    console.log("server is running on port " + port);
})

