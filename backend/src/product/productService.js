const productRepository = require('./productRepository');

class ProductService {
  async getAllProducts() {
    return productRepository.findAll();
  }

  async createProduct({ styleCode, productName, description, material, imageUrl, wholesalePrice }) {
    if (!styleCode || !productName) {
      throw new Error('style_code and product_name are required.');
    }
    return productRepository.create({
      styleCode,
      productName,
      description,
      material,
      imageUrl,
      wholesalePrice
    });
  }
}

module.exports = new ProductService();
