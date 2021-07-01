import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { dirname,join } from 'path'

const { readJSON, writeJSON, writeFile } = fs

const usersJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../data/users.json")
const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../data/authors.json")
const blogsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../data/blogs.json")
const usersPublicFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/users")
const blogsPublicFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/blogs")
const authorsPublicFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/avatar")
const imagesFolder = join(dirname(fileURLToPath(import.meta.url)), "../data/images")

export const getUsers =() => readJSON(usersJSONPath)
export const getAuthors =() => readJSON(authorsJSONPath)
export const getBlogs =() => readJSON(blogsJSONPath)
export const getImages = ()=> readJSON(imagesFolder)

export const writeUsers = content => writeJSON(usersJSONPath, content)
export const writeAuthors = content => writeJSON(authorsJSONPath, content)
export const writeBlogs = content => writeJSON(blogsJSONPath, content)

export const getCurrentFolderPath = currentFile => dirname(fileURLToPath(currentFile))

export const writeUsersPicture = (fileName, content) => writeFile(join(usersPublicFolderPath, fileName), content)
export const writeBlogsPicture = (fileName, content) => writeFile(join(blogsPublicFolderPath, fileName), content)
export const writeAuthorsPicture = (fileName, content) => writeFile(join(authorsPublicFolderPath, fileName), content)
export const writeBlogImages = (filename, content) => writeFile(join(imagesFolder, filename), content)