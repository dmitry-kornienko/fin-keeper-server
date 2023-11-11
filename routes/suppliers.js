const express = require('express');
const router = express.Router();
const { supplier, add, edit, deleteOne } = require('../controllers/suppliers');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');

// // api/supplier/:id 
router.get('/:id', auth, supplier);
// api/supplier/add 
router.post('/add', auth, add);
// api/supplier/edit/:id 
router.patch('/edit/:id', auth, edit);
// // api/supplier/delete/:id 
router.delete('/supplier/delete/:id', auth, deleteOne);

module.exports = router;
