const express = require('express');
const { protectRoute } = require('../middleware/protectRoute');
const { getUsersForSidebar } = require("../controllers/userController");

const router = express.Router();

// This route is protected, so only logged-in users can see the list
router.get('/', protectRoute, getUsersForSidebar);

module.exports = router;