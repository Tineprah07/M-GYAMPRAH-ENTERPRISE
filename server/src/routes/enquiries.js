const router = require('express').Router();
const ctrl = require('../controllers/enquiriesController');
const { validateBody } = require('../middleware/validate');

const schema = {
  name: { required: true, type: 'string', maxLength: 150 },
  email: { required: true, type: 'string', email: true, maxLength: 200 },
  message: { required: true, type: 'string', maxLength: 4000 },
  phone: { type: 'string', maxLength: 50 },
  company: { type: 'string', maxLength: 200 },
  subject: { type: 'string', maxLength: 200 },
};

router.post('/', validateBody(schema), ctrl.createEnquiry);
router.get('/', ctrl.listEnquiries);

module.exports = router;
