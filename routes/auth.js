const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.post("/authenticated", authController.login);
router.get("/verify", authController.verify);
router.post("/reverify", authController.reverify);


module.exports = router;
