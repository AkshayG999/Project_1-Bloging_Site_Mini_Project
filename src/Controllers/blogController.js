
const authorModel = require("../Models/authorModel");
const blogModel = require("../Models/blogModel");

const createBlog = async function (req, res) {
  try {
    const data = req.body;
    const { authorId, title, body, tags, subcategory, category } = data
    let id = req.Tokan.id

    if (!(Object.keys(data).length))
      return res.status(400).send({ status: false, msg: "Please Enter Blog Information" })
    //______________________________authorid present/validataion________________________________________________________________________________________

    if (!authorId) {
      return res.status(400).send({ status: false, msg: "Please enter author Id" });
    }

    let objectIdRegex = /^[a-f\d]{24}$/
    if (!authorId.match(objectIdRegex))
      return res.status(400).send({ status: false, msg: "authorId (ObjectId) Must be 24 byte" })

    //__________________________Authorization(extra)________________________________________________________________________________________

    if (id != authorId) return res.status(403).send({ status: false, msg: "Login User Not authorised for blog create" })

    let authorId1 = await authorModel.findById(data.authorId);
    if (!authorId1) {
      return res.status(400).send("Author Id Invalid");
    }
    //_______________________________________________________________________________________________________________

    if (!title) {
      return res.status(400).send("Please enter title");
    }
    // let titleRegex = /^[A-Za-z]+$/
    // if (!title.match(titleRegex))
    //   return res.status(400).send({ status: false, msg: "title should be first numeric then number(ex- part1)" })
    //____________________________________________________________________________________________________________________________

    if (!body) {
      return res.status(400).send("Please enter body");
    }
    // let bodyRegex =/^[A-Za-z]+$/
    // if (!body.match(bodyRegex))
    //   return res.status(400).send({ status: false, msg: "body should be alphabetic" })
    //____________________________________________________________________________________________________________________________

    if (!tags) {
      return res.status(400).send("Please enter tags");
    }


    if (!category) {
      return res.status(400).send({ status: false, data: "Category is mandretary" })
    }
    //_____________________________________________________________________________________________________________________

    let categoryRegex = /^[A-Za-z]+$/
    if (!category.match(categoryRegex))
      return res.status(400).send({ status: false, msg: "Category must be in alphabet" })

    let subcategoryRegex = /^[A-Za-z]+$/
    if (!subcategory.match(subcategoryRegex))
      return res.status(400).send({ status: false, msg: "SubCategory must be in alphabet" })
    //_________________________________________________________________________________________________________________________

    const newBlog = await blogModel.create(data);
    res.status(201).send({ status: true, data: newBlog });
  } catch (err) {
    res.status(500).send({ msg: err.message });
  }
};

//____________________Get Blogs____________________________________________________________________________________________

const getBlog = async function (req, res) {
  try {
    let keys = req.query
    let authId = keys.authorId

    if (!(Object.keys(keys).length)) {
      let result = await blogModel.find({ deleted: false, published: true })

      if (result.length == 0) return res.status(404).send({ status: false, msg: "No any Data Found" })

      return res.status(200).send({ status: true, data: result })
    }

    if (authId) {
      let objectIdRegex = /^[a-f\d]{24}$/
      if (!authId.match(objectIdRegex)) {
        return res.status(400).send({ status: false, msg: "authorId (ObjectId) Must be 24 byte" })
      }


      let authorId1 = await authorModel.findById(authId);

      if (!authorId1) {
        return res.status(400).send({ status: false, msg: "This AuthorId is not preset in Data Base" });
      }
    }

    let fetchBlogs = await blogModel.find({ $and: [keys, { deleted: false, published: true }] })

    if (fetchBlogs.length == 0) {
      return res.status(404).send({ status: false, msg: "Blog is not found" })
    }

    res.status(200).send({ status: true, data: fetchBlogs })

  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message)
  }
};

//________________Update By BlogID_____________________________________________________________________________________

const updateBlog = async function (req, res) {
  try {
    let getId = req.params.blogId
    let data = req.body

    if (!Object.keys(data).length) {
      return res.status(400).send({ status: false, msg: "Json body absent" })
    }
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
//__________________________Delete By BlogID______________________________________________________________________________

const deleteBlog = async function (req, res) {
  try {
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
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message)
  }
}

//_______________________Delete By Query_____________________________________________________________________________

const deleteByQuery = async function (req, res) {
  try {
    let data = req.obj

    let saved = await blogModel.updateMany({ $and: [data, { deleted: false }] }, { $set: { deleted: true, deletedAt: Date.now() } }, { new: true })
    console.log(saved)
    if (saved.modifiedCount == 0)
      return res.status(200).send({ status: true, msg: "Already Deleted" })

    res.status(200).send({ status: true, msg: "Successfully Deleted" })
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send(error.message)
  }

}
module.exports= {createBlog,getBlog,updateBlog,deleteBlog,deleteByQuery};
 

