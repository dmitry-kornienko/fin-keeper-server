const express = require('express');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();
const { add, addThroughExcel, all, report,editCostPriceOfArticle, remove, editAdditionalParameters } = require('../controllers/reports');
const { auth } = require('../middleware/auth');


// api/report/add 
router.post('/add', auth, add);
// api/report/add-through-excel
router.post('/add-through-excel', upload.single('file'), auth, addThroughExcel);
// api/report 
router.get('/', auth, all);
// api/report/:id
router.get('/:id', auth, report);
// api/report/update-cost-price/:id
router.patch('/update-cost-price/:id', auth, editCostPriceOfArticle);
// api/report/update-additional-parameters/:id
router.patch('/update-additional-parameters/:id', auth, editAdditionalParameters);
// api/report/remove/:id
router.delete('/remove/:id', auth, remove);

module.exports = router;
