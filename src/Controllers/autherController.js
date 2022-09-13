const jwt = require("jsonwebtoken");
const validator = require('validator')
const AuthorModel = require("../modeles/authorModele.js")

const checkvalidResBody = function (resBody) {
    return Object.keys(resBody).length > 0
}

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true
}

const validName = function (name) {
    return (/^(?![\. ])[a-zA-Z\. ]+(?<! )$/.test(name))
}

const validPassword = function (pass) {
    return (/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%&])[a-zA-Z0-9@#$%&]{6,20}$/.test(pass))
}

// ======================================== Create Auther ===================================

const createAuthor = async function (req, res) {
    try {
        let author = req.body
        if (!checkvalidResBody(author)) {
            return res.status(400).send({ status: false, message: "Invalide Request. Please Provide Auther Details" })
        }

        let { fname, lname, title, email, password } = author  // Object Destructing

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "first name is required" })
        }
        if (!validName(fname)) return res.status(400).send({ status: false, message: "fname Should be Letters" })

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "last name is required" })
        }
        if (!validName(lname)) return res.status(400).send({ status: false, message: "lname Should be Letters" })


        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "title is required" })
        }

        if (title !== "Mr" && title !== "Mrs" && title !== "Miss") {
            return res.status(400).send({ status: false, message: "Please Send The Valid title like:- Mr, Mrs, Miss" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, msg: " please Enter valid EmailId" })
        }

        let isEmailAlreadyUsed = await AuthorModel.findOne({ email })

        if (isEmailAlreadyUsed) {
            return res.status(400).send({ status: false, msg: "Email is Already Registered" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }

        if (!validPassword(password)) {
            return res.status(400).send({ status: false, message: " Password should be min 6 and max 20 character.It contains atleast--> 1 Uppercase letter, 1 Lowercase letter, 1 Number, 1 Special character" })
        }

        let authorCreated = await AuthorModel.create(author)
        res.status(201).send({ status: true, message: "Auther created Successfully", data: authorCreated })
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

// ================================= Login Auther =====================================

const loginAuther = async function (req, res) {
    try {
        let loginDetail = req.body
        if (!checkvalidResBody(loginDetail)) {
            return res.status(400).send({ status: false, message: "Invalide Request. Please Provide Auther Details" })
        }

        let { email, password } = loginDetail

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, msg: " please Enter valid EmailId" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }

        
        let auther = await AuthorModel.findOne({ email, password })

        if (!auther) {
            return res.status(401).send({ status: false, message: "Email or Password Is wrong " })
        }

        let token = jwt.sign(
            {
                AutherId: auther._id.toString(),
                batch: "plutonium",
                organisation: "FunctionUp",
            },
            "Project-1-blogging-groupe-50"
        );
        res.setHeader("x-api-key", token);
        res.status(201).send({ status: true,message:"Login successfull", token: token });
    } catch (error) {
        res.status(500).send({ msg: "Error", error: error.message })
    }
}

module.exports = { createAuthor, loginAuther } 