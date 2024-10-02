const express = require("express");
const router = express.Router();
const basicAuth = require("../middleware/basicAuth");

const userController = require("../controller/userController");

router.post("/", userController.createUser);

router.get("/self", basicAuth,userController.getAUser);

router.put("/self", basicAuth,userController.updateUser);

module.exports = router;
