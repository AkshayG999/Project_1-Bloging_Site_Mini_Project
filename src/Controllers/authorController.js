const authorModel = require("../Models/authorModel");
const jwt = require('jsonwebtoken');

const createAuthor = async function (req, res) {
  try {
    const data = req.body;

    if (!data.fname) {
      return res.status(400).send("Please enter first name");
    }
    let nameregex = /^[A-Za-z]+$/
    if (!data.fname.match(nameregex)) {
      return res.status(400).send({ status: false, message: "fname should be in alphabate" })
    }
    //   ........................................................
    if (!data.lname) {
      return res.status(400).send("Please enter last name");
    }
    if (!data.lname.match(nameregex)) {
      return res.status(400).send({ status: false, message: "lname should be in alphabate" })
    }
    //   ...............................................................
    if (!data.title) {
      return res.status(400).send("Please enter the title");
    }
    let titleRegex = /^(Miss|Mr|Mrs)$/
    if (!data.title.match(titleRegex)) {
      return res.status(400).send({ status: false, message: "Title should be in between'Mr', 'Mrs', 'Miss'" })
    }

    // ************************* email validation(start) **************************************
    if (!data.email) {
      return res.status(400).send("Please enter email Id");
    } // email is required if not pass message

    let regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!data.email.match(regex)) {
      return res.status(400).send("Email Id is invalid");
    } // if id is not matching with regex

    //   .......................................................................

    let isEmail = await authorModel.findOne({ email: data.email });

    if (isEmail) {
      return res.status(400).send("This email Id is already exists");
    } // if id is already present

    //   *************************** email validation (end) *****************************

    let passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    if (!data.password) {
      return res.status(400).send("Please enter password");
    }
    if (!data.password.match(passwordRegex)) {
      return res.status(400).send({ status: false, message: " Minimum eight characters, at least one uppercase letter, one lowercase letter and one number" })
    }

    const newAuthor = await authorModel.create(data);
    res.status(201).send({ status: true, data: newAuthor })

  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
}
//_____________________Login________________________________________________________________________

const authorLogin = async function (req, res) {
  let data = req.body;

  if (!(Object.keys(data).length)) return res.status(400).send({ status: false, message: "Please enter Email & password" })
  let userName = data.email;

  if (!userName) return res.status(400).send({ status: false, message: "please Enter Email" })
  let password = data.password;

  if (!password) return res.status(400).send({ status: false, message: "please Enter Password" })

  let login = await authorModel.findOne({ email: userName, password: password }).select({ _id: 1 })

  if (!login) {
    return res.status(400).send({ status: false, message: 'Please enter valid email or password' })
  }
  let token = jwt.sign(
    {
      id: login._id.toString(),
      project: 'project-1'
    },
    "secretKey"
  )
  res.setHeader("x-api-key", token)
  res.status(201).send({ status: true, data: token })
};

module.exports = { createAuthor, authorLogin };

