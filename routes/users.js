const express = require('express');
const router = express.Router();
const { login, register, updateInfo, updatePassword, allUsers, current } = require('../controllers/users');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

// api/user/login 
router.post('/login', login);
// api/user/register 
router.post('/register', register);
// api/user/update-info/:id 
router.patch('/update-info/:id', auth, updateInfo);
// api/user/update-password/:id 
router.patch('/update-password/:id', auth, updatePassword);
// api/user/current 
router.get('/current', auth, current);
// api/user 
router.get('/', auth, isAdmin, allUsers);

module.exports = router;
