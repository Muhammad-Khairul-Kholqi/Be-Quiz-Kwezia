const express = require('express');
const FaqController = require('../controllers/faqController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', FaqController.getAll);
router.get('/:id', FaqController.getById);

router.post('/',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    FaqController.create
);

router.put('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    FaqController.update
);

router.delete('/:id',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    FaqController.delete
);

module.exports = router;