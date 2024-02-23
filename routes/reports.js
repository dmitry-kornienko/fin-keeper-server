const express = require('express');
const router = express.Router();
const { add } = require('../controllers/reports');
const { auth } = require('../middleware/auth');


// api/report/add 
router.post('/add', auth, add);

module.exports = router;
