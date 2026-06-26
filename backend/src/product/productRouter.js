const express = require('express');
const router = express.Router();
const productService = require('./productService');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { style_code, product_name, description, material, image_url, wholesale_price } = req.body;
    const product = await productService.createProduct({
      styleCode: style_code,
      productName: product_name,
      description,
      material,
      imageUrl: image_url,
      wholesalePrice: wholesale_price
    });
    return res.status(201).json({
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
