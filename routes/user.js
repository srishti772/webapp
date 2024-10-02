const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/", userController.createUser);

router.get("/:id", userController.getAUser);

module.exports = router;
