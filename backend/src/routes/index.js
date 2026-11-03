const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const categoryRoutes = require('./categoryRoutes');
const locationRoutes = require('./locationRoutes');
const reviewRoutes = require('./reviewRoutes');

router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/locations', locationRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;

