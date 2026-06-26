const express = require('express');
const router = express.Router();
const authService = require('./authService');

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const result = await authService.register({ email, password, name, role });
    return res.status(201).json({
      message: 'User registered successfully.',
      user: result
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return res.status(200).json({
      message: 'Login successful.',
      ...result
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
