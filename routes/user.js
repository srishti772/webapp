const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/", userController.createUser);

router.get("/:email", userController.getAUser);

router.put("/:email", userController.updateUser);

module.exports = router;
