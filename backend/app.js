const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const postRoutes = require("./routes/posts");
const userRouter = require("./routes/user");
const app = express();

mongoose.connect("mongodb+srv://tushar:MpmlI5u88soMU73K@cluster0-g1jyu.mongodb.net/node-angular?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database connected!");
    }).catch((

        err) => {
        console.log(err);
    });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept,Authorization "
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS , PUT"
    );
    next();
});

app.use("/api/posts/", postRoutes);
app.use("/api/user/", userRouter);

module.exports = app;
