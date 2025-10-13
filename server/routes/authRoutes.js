const express = require('express');
const { signinUser, signupUser } = require('../controllers/authController')

// express.Router() is a built-in feature of Express that acts like a "mini-application," 
// allowing you to group related route handlers into a single, modular file.
const router = express.Router();

router.post('/signup', signupUser);
router.post('/signin', signinUser);

module.exports = router;