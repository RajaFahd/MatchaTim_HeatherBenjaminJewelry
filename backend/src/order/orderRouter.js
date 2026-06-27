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
    const { search, status, date, customer, sortBy, isArchived, isDeleted } = req.query;
    const orders = await orderService.getAllOrders({ search, status, date, customer, sortBy, isArchived, isDeleted });
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

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.updateOrder(id, req.body);
    return res.status(200).json({
      message: 'Order details and items updated successfully.',
      order
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/packing', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { packingNote, checklist } = req.body;
    const packing = await orderService.updatePacking(id, { packingNote, checklist });
    return res.status(200).json({
      message: 'Packing details and checklist updated successfully.',
      packing
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/production', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { productionNote, artisanNote } = req.body;
    const production = await orderService.updateProduction(id, { productionNote, artisanNote });
    return res.status(200).json({
      message: 'Production instructions updated successfully.',
      production
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Soft Delete Order
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.softDeleteOrder(id);
    return res.status(200).json({
      message: 'Order soft deleted successfully.',
      order
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Archive Order
router.put('/:id/archive', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.archiveOrder(id);
    return res.status(200).json({
      message: 'Order archived successfully.',
      order
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Restore Order
router.put('/:id/restore', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.restoreOrder(id);
    return res.status(200).json({
      message: 'Order restored successfully.',
      order
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

