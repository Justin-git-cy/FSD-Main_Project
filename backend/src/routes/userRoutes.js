const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  loginUser,
  updateUser,
} = require('../controllers/userController');

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/login', loginUser);
router.put('/:id', updateUser);

module.exports = router;

