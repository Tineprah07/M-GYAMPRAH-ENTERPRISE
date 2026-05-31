const router = require('express').Router();
const ctrl = require('../controllers/productsController');
const { validateBody } = require('../middleware/validate');

const productSchema = {
  name: { required: true, type: 'string', maxLength: 200 },
  slug: { required: true, type: 'string', maxLength: 200 },
  category: { required: true, type: 'string', maxLength: 100 },
  price: { required: true, type: 'number' },
};

router.get('/', ctrl.listProducts);
router.get('/categories', ctrl.listCategories);
router.get('/:id', ctrl.getProduct);
router.post('/', validateBody(productSchema), ctrl.createProduct);
router.patch('/:id', ctrl.updateProduct);
router.delete('/:id', ctrl.deleteProduct);

module.exports = router;
