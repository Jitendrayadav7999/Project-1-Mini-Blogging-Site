const blogModel = require("../modeles/blogModel")
const autherModel = require("../modeles/authorModele")
const mongoose = require("mongoose")

const checkvalidResBody = function (resBody) {
    return Object.keys(resBody).length > 0
}

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

const isValidObjectId = function (objectid) {
    return mongoose.Types.ObjectId.isValid(objectid)
}

// ======================================>> create Blogs <<========================================//

const createBlogs = async function (req, res) {
    try {
        const blog = req.body
        if (!checkvalidResBody(blog)) {
            return res.status(400).send({ status: false, message: "Invalide Request. Please Provide Blog Details" })
        }

        let { title, body, authorId, tags, category, subcategory, isPublished } = blog

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Blog title name is required" })
        }

        if (!isValid(body)) {
            return res.status(400).send({ status: false, message: "Blog body name is required" })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: "Blog category name is required" })
        }

        if (!isValid(authorId)) {
            return res.status(400).send({ status: false, message: "Auther Id is required" })
        }

        if (!isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, message: "Invalid Auther Id" })
        }


        let auther = await autherModel.findById(authorId)

        if (!auther) {
            return res.status(401).send({ status: true, msg: " Auther is not valid" })
        }

        const blogData = {
            title,
            body,                     //title, body, authorId, tags, category, subcategory
            authorId,
            category,
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }

        if (tags) {
            if (Array.isArray(tags)) {
                blogData['tags'] = [...tags]
            }
            if (Object.prototype.toString.call(tags === "[object String]")) {
                blogData["tags"] = [tags]
            }
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                blogData['subcategory'] = [...subcategory]
            }
            if (Object.prototype.toString.call(subcategory) === "[object String]") {
                blogData["subcategory"] = [subcategory]
            }
        }
        let createdBlogs = await blogModel.create(blog)
        res.status(201).send({ status: true, message: "new blog created Successfull", data: createdBlogs })
    } catch (error) {
        res.status(500).send({ msg: "Error", error: error.message })
    }
}

// ====================================>> Get Blogs <<===============================================//

const getBologs = async function (req, res) {
    try {
        let data = req.query
        
        const findData = { isDeleted: false, isPublished: true, ...data }

        let getBolog = await blogModel.find(findData)

        if (getBolog.length == 0) {
            return res.status(404).send({ status: false, msg: "Blogs Not Found" })
        }

        return res.status(200).send({ status: true, data: getBolog })

    } catch (error) {
        res.status(500).send({ msg: "Error", error: error.message })
    }
}

// ======================================>> Update Blog <<========================================//


const updateBlogs = async function (req, res) {
    try {

        let data = req.body
        if (!checkvalidResBody(data)) {
            return res.status(400).send({ status: false, message: "Invalide Request." })
        }


        let blog = req.blog._id
        let { title, body, tags, subcategory, isPublished } = data

        let updateBlogs = await blogModel.findByIdAndUpdate(
            blog,
            {
                $set: { body: body, title: title, isPublished: isPublished, publishedAt: new Date },
                $push: { tags: tags, subcategory: subcategory }
            }, { new: true })
        return res.status(200).send({ status: true,message:"successFull" ,data: updateBlogs })

    } catch (error) {
        res.status(500).send({ msg: "Error", error: error.message })
    }

}

// ======================================>> Delete Blog <<========================================//


const deleteblog = async function (req, res) {
    try {
        let blogid = req.params.blogId               // blogId validation in auth File
        let deletedblog = await blogModel.findByIdAndUpdate(blogid, { $set: { isDeleted: true, deletedAt: new Date } })
        return res.status(200).send({ status: true })
    } catch (error) {
        return res.status(500).send({ msg: "Error", error: error.message })
    }
}

// ======================================>> Delete blog using Filter <<=============================//


const deleteBloggByQuery = async function (req, res) {
    try {
        let tokenAutherId = req.AutherId
        let data = req.query
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, msg: "Please Give Any Filter" })
       
    
        let findauther2 = await blogModel.findOne({ data, isDeleted: false })
        if (!findauther2) return res.status(404).send({ status: false, msg: "Blog Already Deleted" })

        let autherId = findauther2.authorId

        if (tokenAutherId == autherId) {
            let deleteblog = await blogModel.findOneAndUpdate(autherId, { $set: { isDeleted: true, deletedAt: new Date } })
            return res.status(200).send({ status: true })
        } else {
            return res.status(403).send({ status: false, msg: "Sorry You are not authorised" })
        }

    } catch (error) {
        res.status(500).send({ msg: "Error", error: error.message })
    }
}

module.exports = { createBlogs, getBologs, updateBlogs, deleteblog, deleteBloggByQuery } 