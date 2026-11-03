const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocationById,
  createLocation,
  upvoteLocation,
  verifyLocation,
  getRecommendations,
} = require('../controllers/locationController');

router.get('/', getLocations);
router.post('/', createLocation);
router.post('/recommendations', getRecommendations);
router.get('/:id', getLocationById);
router.patch('/:id/upvote', upvoteLocation);
router.patch('/:id/verify', verifyLocation);

module.exports = router;

