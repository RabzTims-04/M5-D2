import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { dirname,join } from 'path'

const { readJSON, writeJSON, writeFile } = fs

const usersJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../data/users.json")
const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../data/authors.json")
const blogsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../data/blogs.json")
const usersPublicFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../../public/img/users")

export const getUsers =() => readJSON(usersJSONPath)
export const getAuthors =() => readJSON(authorsJSONPath)
export const getBlogs =() => readJSON(blogsJSONPath)

export const writeUsers = content => writeJSON(usersJSONPath, content)
export const writeAuthors = content => writeJSON(authorsJSONPath, content)
export const writeBlogs = content => writeJSON(blogsJSONPath, content)

export const getCurrentFolderPath = currentFile => dirname(fileURLToPath(currentFile))

export const writeUsersPicture = (fileName, content) => writeFile(join(usersPublicFolderPath, fileName), content)