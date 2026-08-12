const express = require('express');
const router  = express.Router();
const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
} = require('../controllers/requestController');

router.route('/').get(getRequests).post(createRequest);
router.route('/:id').get(getRequestById).put(updateRequest).delete(deleteRequest);

module.exports = router;
