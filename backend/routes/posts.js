const express = require("express");
const postController = require("../controllers/post");
const checkAuth = require("../middleware/check-auth");
const extracFile = require("../middleware/fileUpload");
const router = express.Router();


router.post("", checkAuth, extracFile, postController.createPost);

router.put("/:id", checkAuth, extracFile, postController.updatePost);

router.get("", postController.getPosts);

router.get("/:id", postController.getPost);

router.delete("/:id", checkAuth, postController.deletePost);

module.exports = router;
