const Request = require('../models/Request');

// @desc  Get all active requests
// @route GET /api/requests
const getRequests = async (req, res, next) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : { status: 'open' };
    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single request
// @route GET /api/requests/:id
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// @desc  Create request
// @route POST /api/requests
const createRequest = async (req, res, next) => {
  try {
    const request = await Request.create(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// @desc  Update request
// @route PUT /api/requests/:id
const updateRequest = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete request
// @route DELETE /api/requests/:id
const deleteRequest = async (req, res, next) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, message: 'Request removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRequests, getRequestById, createRequest, updateRequest, deleteRequest };
