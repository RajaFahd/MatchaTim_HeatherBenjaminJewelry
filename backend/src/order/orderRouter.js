const express = require('express');
const router = express.Router();
const orderService = require('./orderService');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// All order routes require authentication
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const result = await orderService.uploadOrder(req.file);
    return res.status(201).json({
      message: 'Purchase Order uploaded, processed by AI, and saved successfully.',
      order: result
    });
  } catch (error) {
    console.error('Upload route error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query;
    const orders = await orderService.getAllOrders(status);
    return res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderDetails(id);
    return res.status(200).json(order);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(id, status);
    return res.status(200).json({
      message: `Order status updated to ${status} successfully.`,
      order
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
