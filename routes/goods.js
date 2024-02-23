const express = require('express');
const router = express.Router();
const { good, all, add, update, remove } = require('../controllers/goods');
const { auth } = require('../middleware/auth');

// api/good 
router.get('/', all);
// api/good/:id 
router.get('/:id', good);
// api/good/add 
router.post('/add', auth, add);
// api/good/update/:id 
router.put('/update/:id', auth, update);
// api/good/update-password/:id 
router.delete('/remove/:id', auth, remove);

module.exports = router;
