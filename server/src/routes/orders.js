const router = require('express').Router();
const ctrl = require('../controllers/ordersController');
const { validateBody } = require('../middleware/validate');

const schema = {
  customer_name: { required: true, type: 'string', maxLength: 150 },
  customer_email: { required: true, type: 'string', email: true, maxLength: 200 },
  items: { required: true, type: 'array' },
  customer_phone: { type: 'string', maxLength: 50 },
  customer_company: { type: 'string', maxLength: 200 },
  notes: { type: 'string', maxLength: 2000 },
};

router.post('/', validateBody(schema), ctrl.createOrder);
router.get('/', ctrl.listOrders);

module.exports = router;
