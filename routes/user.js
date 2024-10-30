const express = require("express");
const router = express.Router();
const basicAuth = require("../middleware/basicAuth");

const userController = require("../controller/userController");
const upload = require("../config/multer");

router.post("/", userController.createUser);

router.get("/self", basicAuth,userController.getAUser);

router.put("/self", basicAuth,userController.updateUser);

router.post("/self/pic", basicAuth, upload.single('profilePic'),userController.uploadProfilePic);

router.get('/self/pic', basicAuth, userController.getProfilePic); 

module.exports = router;
