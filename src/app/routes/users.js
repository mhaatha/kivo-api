const router = require('express').Router();
const { greetUser } = require('../controllers/users');

router.get('/', greetUser);

module.exports = router;
