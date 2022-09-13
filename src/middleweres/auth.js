const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const blogModel = require("../modeles/blogModel");

const checkvalidparams = function (resBody) {
    return Object.keys(resBody).length > 0
}

const isValidObjectId = function (objectid) {
    return mongoose.Types.ObjectId.isValid(objectid)
}

// ============================================>> Authentication use for identifying user to access a system<<===================================================


const tokenverify = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (token) {
            let decodedToken = jwt.verify(token, "Project-1-blogging-groupe-50")
            if(!decodedToken){
                return res.status(401).send({ status: false, msg: "Invalid Token" }); 
            }
            let auther = decodedToken.AutherId
            req.AutherId = auther
            next();
        } else {
            return res.status(400).send({ status: false, msg: "token must be present" });
        }
    } catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }

};

// ============================================>> Authorisation  giving permission to access the resources<<===================================================

const auth = async function (req, res, next) {
    try {
        let tokenAutherId = req.AutherId
        let blogid = req.params.blogId
        if (!checkvalidparams(blogid)) {
            return res.status(400).send({ status: false, message: "Please Provide Blog Id in Path Params" })
        }

        if (!isValidObjectId(blogid)) {
            return res.status(400).send({ status: false, message: "Invalid Blog Id" })
        }

        let findauther = await blogModel.findOne({ _id: blogid, isDeleted: false })

        if (!findauther) return res.status(404).send({ status: false, msg: "This Blog is Already Deleted You Can Not Modify" })

        let Auther = findauther.authorId
        if (tokenAutherId == Auther) {
            req.blog = findauther
            next();
        } else {
            return res.status(403).send({ status: false, msg: "Sorry You are not authorised" })
        }
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

module.exports ={ tokenverify, auth}

