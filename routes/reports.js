const express = require('express');
const router = express.Router();
const { add } = require('../controllers/reports');
const { auth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/isAdmin');


// // api/supplier 
// router.get('/', auth, suppliersCurrentUser);
// api/supplier/add 
router.post('/add', auth, add);
// api/supplier/edit/:id 
// router.patch('/edit/:id', auth, edit);
// // // api/supplier/delete/:id 
// router.patch('/change-active-supplier/:id', auth, changeActiveSupplier);
// // // api/supplier/delete/:id 
// router.delete('/supplier/delete/:id', auth, deleteOne);

module.exports = router;
