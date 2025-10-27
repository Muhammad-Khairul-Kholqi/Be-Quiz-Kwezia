const express = require('express');
const StatsController = require('../controllers/statsController');
const router = express.Router();

router.get('/public', StatsController.getPublicStats);

module.exports = router;