
const { mongo } = require("mongoose");
const authorModel = require("../Models/authorModel");
const blogModel = require("../Models/blogModel");

const createBlog = async function (req, res) {
  try {
    const data = req.body;
    let array = Object.keys(data).length
    if (!array) return res.status(400).send({ status: false, msg: "Please Enter Blog Information" })

    let id = req.Tokan.id
    if (!data.authId) {
      return res.status(400).send("Please enter author Id");
    }
    //____________Authorization________________________________________________________________________________________

    if (id != data.authorId) return res.status(403).send({ status: false, msg: "Login User Not authorised for blog create" })

    let authorId = await authorModel.findById(data.authorId);
    if (!authorId) {
      return res.status(400).send("Author Id Invalid");
    }
    //_______________________________________________________________________________________________________________

    if (!data.title) {
      return res.status(400).send("Please enter title");
    }
    let titleRegex = /^[a-zA-Z][-_][0-9]+$/
    if (!data.title.match(titleRegex)) return res.status(400).send({ status: false, msg: "title should be first numeric then number(ex- part1)" })
    //____________________________________________________________________________________________________________________________

    if (!data.body) {
      return res.status(400).send("Please enter body");
    }
    let bodyRegex = /^[a-zA-Z]+$/
    if (!data.body.match(bodyRegex)) return res.status(400).send({ status: false, msg: "body should be alphabetic" })
    //____________________________________________________________________________________________________________________________

    if (!data.tags) {
      return res.status(400).send("Please enter tags");
    }
    //_____________________________________________________________________________________________________________________

    let categoryRegex = /^[A-Za-z]+$/
    if (!data.category.match(categoryRegex)) return res.send.status(400).send({ status: false, msg: "Category must be in alphabet" })

    let subcategoryRegex = /^[A-Za-z]+$/
    if (!data.subcategory.match(subcategoryRegex)) return res.send.status(400).send({ status: false, msg: "SubCategory must be in alphabet" })
    //_________________________________________________________________________________________________________________________

    const newBlog = await blogModel.create(data);
    res.status(201).send({ status: true, data: newBlog });
  } catch (err) {
    res.status(500).send({msg:err.msg});
  }
}; // post

// get
const getBlog = async function (req, res) {
  try {
    let keys = req.query
    let authId = keys.authorId
    console.log(authId)
    let array = Object.keys(keys).length

    if (!array) {
      let result = await blogModel.find({ deleted: false, published: true })
      return res.status(200).send({ status: true, data: result })
    }
    if (authId) {
      let authorId1 = await authorModel.findById(authId);
      if (!authorId1) {
        return res.status(400).send({ status: false, msg: "Author Id Invalid" });
      }
    }

    let fetchBlogs = await blogModel.find({ $and: [keys, { deleted: false, published: true }] })
    let variable = fetchBlogs.length //0
    if (variable == 0) { // 0 == 0
      return res.status(404).send({ status: false, msg: "Blog is not found" })
    }

    res.status(200).send({ status: true, data: fetchBlogs })
  } catch (err) { res.status(500).send(err.msg) };
}

const updateBlog = async function (req, res) {
  try {
    let getId = req.params.blogId
    let data = req.body
    let checkId = await blogModel.findOne({ _id: getId })

    if (checkId) {
      if (checkId.deleted === false) {
        let check = await blogModel.findByIdAndUpdate(getId, { $push: { tags: data.tags, subcategory: data.subcategory }, title: data.title, body: data.body, published: true, publishedAt: Date.now() }, { new: true })
        res.status(200).send({ status: true, data: check })
      }
      else {
        res.status(404).send("CANT UPDATE , IT IS DELETED")
      }
    }
    else {
      res.status(401).send({ status: false, msg: "Please enter valid Blog id" })
    }
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message)
  }
}

const deleteBlog = async function (req, res) {
  let blogId = req.params.blogId

  if (!blogId) { return res.status(404).send("KINDLY ADD BLOG ID") }
  let blog = await blogModel.findById(blogId)

  if (!blog) { return res.status(404).send("NOT A VALID BLOG ID") }
  if (blog.deleted == false) {
    let save = await blogModel.findOneAndUpdate({ _id: blogId }, { $set: { deleted: true, deletedAt: Date.now() } }, { new: true })

    return res.status(200).send({ msg: "successfully deleted Blog" });
  } else {
    res.status(404).send({ status: false, msg: "already deleted" })
  }
}

const deletebyquery = async function (req, res) {
  let data = req.query

  console.log(data)
  let find = await blogModel.findOne(data)
  console.log(find)
  if (!find) { return res.status(404).send({ status: false, msg: "Blog is not created" }) }

  if (find.deleted == true) { return res.status(400).send({ status: false, msg: "THIS DOCUMENT Is deleted" }) }

  let saved = await blogModel.findOneAndUpdate(data, { $set: { deleted: true, deletedAt: Date.now() } }, { new: true })
  res.status(200).send({ status: true, msg: saved })

  //   const filterQuery = {isDeleted: false}
  // if(isValid(category)) {
  // filterQuery['category'] = category.trim()
  // }

  // if(isValid(isPublished)) {
  // filterQuery['isPublished'] = isPublished
  // }
  // if(isValid(tags)) {const tagsArr = tags.trim().split(',').map(tag => tag.trim());
  // filterQuery['tags'] = {$all: tagsArr}
  //  }

  // if(isValid(subcategory)) {
  //             const subcatArr = subcategory.trim().split(',').map(subcat => subcat.trim());
  //             filterQuery['subcategory'] = {$all: subcatArr}
  //         }

  //         const blogs = await blogModel.find(filterQuery);

}



module.exports.createBlog = createBlog;
module.exports.getBlog = getBlog;
module.exports.updateBlog = updateBlog;
module.exports.deleteBlog = deleteBlog;
module.exports.deletebyquery = deletebyquery;

