const express = require("express");

const router = express.Router();

const {
  registerOrganization,
} = require("../controllers/organizationController");

router.post(
  "/register",
  registerOrganization
);

module.exports = router;