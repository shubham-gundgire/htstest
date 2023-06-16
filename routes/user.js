const router = require("express").Router();
const {getAllUsers} = require('../controller/user');

router.get('/getAllUsers',getAllUsers);

module.exports = router;