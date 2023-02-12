const express = require('express');
const router = express.Router();
const authorController = require('../Controllers/authorController');
const blogController = require('../Controllers/blogController');
const middleware = require('../middleware/auth')

router.get('/test-me', (req, res) => {
    console.log('I am running');
    res.send('I am running')
});

router.post('/authors', authorController.createAuthor);

router.post('/login', authorController.authorLogin)

router.post('/blogs', middleware.authentication, blogController.createBlog);

router.get('/blogs', middleware.authentication, blogController.getBlog); //middleware.Authorise, 

router.put('/blogs/:blogId', middleware.authentication, middleware.Authorise, blogController.updateBlog);

router.delete('/blogs/:blogId', middleware.authentication, middleware.Authorise, blogController.deleteBlog);

router.delete('/blogs', middleware.authentication, middleware.deleteByQuery, blogController.deleteByQuery);


module.exports = router
