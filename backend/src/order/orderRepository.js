const prisma = require('../config/prisma');

class OrderRepository {
  async createOrderWithDetails({ orderData, itemsData, productionData, packingData }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create order
      const order = await tx.order.create({
        data: orderData
      });

      // 2. Create order items
      if (itemsData && itemsData.length > 0) {
        const itemsWithOrderId = itemsData.map(item => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          material: item.material,
          specialRequest: item.specialRequest
        }));
        
        await tx.orderItem.createMany({
          data: itemsWithOrderId
        });
      }

      // 3. Create production instructions
      if (productionData) {
        await tx.production.create({
          data: {
            orderId: order.id,
            productionNote: productionData.productionNote,
            artisanNote: productionData.artisanNote,
            generatedByAi: productionData.generatedByAi ?? true
          }
        });
      }

      // 4. Create packing guide
      if (packingData) {
        await tx.packing.create({
          data: {
            orderId: order.id,
            packingNote: packingData.packingNote,
            checklist: packingData.checklist ?? [],
            generatedByAi: packingData.generatedByAi ?? true
          }
        });
      }

      // 5. Add initial tracking status
      await tx.tracking.create({
        data: {
          orderId: order.id,
          status: order.status
        }
      });

      return order;
    });
  }

  async findAll(statusFilter) {
    const whereClause = statusFilter ? { status: statusFilter } : {};
    return prisma.order.findMany({
      where: whereClause,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findDetails(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        productions: true,
        packings: true,
        trackings: {
          orderBy: { updatedAt: 'asc' }
        }
      }
    });
  }

  async updateStatus(id, status) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status }
      });

      await tx.tracking.create({
        data: {
          orderId: id,
          status
        }
      });

      return order;
    });
  }
}

module.exports = new OrderRepository();
