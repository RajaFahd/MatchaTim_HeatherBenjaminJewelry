const prisma = require('../config/prisma');

class ProductRepository {
  async findAll() {
    return prisma.product.findMany({
      orderBy: { styleCode: 'asc' }
    });
  }

  async create({ styleCode, productName, description, material, imageUrl, wholesalePrice }) {
    return prisma.product.create({
      data: {
        styleCode,
        productName,
        description,
        material,
        imageUrl,
        wholesalePrice: wholesalePrice || 0.00
      }
    });
  }
}

module.exports = new ProductRepository();
