const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/route');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());

mongoose.connect(process.env.url)
    .then(() => console.log('MongoDB is connected'))
    .catch((error) => console.log(error));

app.use('/', route);

app.listen(process.env.port, function () {
    console.log('Express is running on ' + (process.env.port));
})