const express = require('express');
const router = express.Router();
const { good, all, add, updateAll, remove } = require('../controllers/goods');
const { auth } = require('../middleware/auth');

// api/good 
router.get('/', auth, all);
// api/good/:id 
router.get('/:id', auth, good);
// api/good/add 
router.post('/add', auth, add);
// api/good/update/:id 
router.patch('/update-all', auth, updateAll);
// api/good/update-password/:id 
router.delete('/remove/:id', auth, remove);

module.exports = router;
