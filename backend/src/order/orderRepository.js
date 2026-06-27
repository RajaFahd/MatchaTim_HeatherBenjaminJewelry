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
          styleCode: item.styleCode,
          productName: item.productName,
          unitPrice: item.unitPrice,
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

  async upsertOrderWithDetails({ orderData, itemsData, productionData, packingData }) {
    return prisma.$transaction(async (tx) => {
      // Find existing order by poNumber
      const existingOrder = await tx.order.findFirst({
        where: { poNumber: orderData.poNumber }
      });

      let order;
      if (existingOrder) {
        // 1. Update existing order metadata
        order = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            uploadFile: orderData.uploadFile,
            notes: orderData.notes,
            status: orderData.status // 'Uploaded'
          }
        });

        // 2. Delete existing items and insert new ones
        await tx.orderItem.deleteMany({
          where: { orderId: existingOrder.id }
        });

        if (itemsData && itemsData.length > 0) {
          const itemsWithOrderId = itemsData.map(item => ({
            orderId: existingOrder.id,
            productId: item.productId,
            styleCode: item.styleCode,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            size: item.size,
            material: item.material,
            specialRequest: item.specialRequest
          }));
          await tx.orderItem.createMany({
            data: itemsWithOrderId
          });
        }

        // 3. Update or create production instructions
        if (productionData) {
          const existingProd = await tx.production.findFirst({
            where: { orderId: existingOrder.id }
          });
          if (existingProd) {
            await tx.production.update({
              where: { id: existingProd.id },
              data: {
                productionNote: productionData.productionNote,
                artisanNote: productionData.artisanNote,
                generatedByAi: productionData.generatedByAi ?? true
              }
            });
          } else {
            await tx.production.create({
              data: {
                orderId: existingOrder.id,
                productionNote: productionData.productionNote,
                artisanNote: productionData.artisanNote,
                generatedByAi: productionData.generatedByAi ?? true
              }
            });
          }
        }

        // 4. Update or create packing guide
        if (packingData) {
          const existingPack = await tx.packing.findFirst({
            where: { orderId: existingOrder.id }
          });
          if (existingPack) {
            await tx.packing.update({
              where: { id: existingPack.id },
              data: {
                packingNote: packingData.packingNote,
                checklist: packingData.checklist ?? [],
                generatedByAi: packingData.generatedByAi ?? true
              }
            });
          } else {
            await tx.packing.create({
              data: {
                orderId: existingOrder.id,
                packingNote: packingData.packingNote,
                checklist: packingData.checklist ?? [],
                generatedByAi: packingData.generatedByAi ?? true
              }
            });
          }
        }

        // 5. Add new tracking status entry to keep history intact
        await tx.tracking.create({
          data: {
            orderId: existingOrder.id,
            status: orderData.status // 'Uploaded'
          }
        });

      } else {
        // Create new order
        order = await tx.order.create({
          data: orderData
        });

        // Create order items
        if (itemsData && itemsData.length > 0) {
          const itemsWithOrderId = itemsData.map(item => ({
            orderId: order.id,
            productId: item.productId,
            styleCode: item.styleCode,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            size: item.size,
            material: item.material,
            specialRequest: item.specialRequest
          }));
          await tx.orderItem.createMany({
            data: itemsWithOrderId
          });
        }

        // Create production instructions
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

        // Create packing guide
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

        // Add initial tracking status
        await tx.tracking.create({
          data: {
            orderId: order.id,
            status: order.status
          }
        });
      }

      return order;
    });
  }

  async findAll(filters = {}) {
    let search, status, date, customer, sortBy, isArchived, isDeleted;
    if (typeof filters === 'string') {
      status = filters;
    } else if (filters) {
      ({ search, status, date, customer, sortBy, isArchived, isDeleted } = filters);
    }

    const whereClause = {};

    whereClause.isDeleted = isDeleted !== undefined ? (isDeleted === true || isDeleted === 'true') : false;
    whereClause.isArchived = isArchived !== undefined ? (isArchived === true || isArchived === 'true') : false;

    if (status) {
      whereClause.status = status;
    }

    if (customer) {
      whereClause.customerName = {
        contains: customer,
        mode: 'insensitive'
      };
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    if (search) {
      whereClause.OR = [
        {
          poNumber: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          customerName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          items: {
            some: {
              OR: [
                {
                  productName: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  styleCode: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  product: {
                    productName: {
                      contains: search,
                      mode: 'insensitive'
                    }
                  }
                }
              ]
            }
          }
        }
      ];
    }

    const orderBy = sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    return prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy
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

  async updateOrderWithDetails(id, { orderData, itemsData }) {
    return prisma.$transaction(async (tx) => {
      // 1. Update order
      const order = await tx.order.update({
        where: { id },
        data: orderData
      });

      // 2. Update order items
      if (itemsData && itemsData.length > 0) {
        for (const item of itemsData) {
          if (item.id) {
            await tx.orderItem.update({
               where: { id: item.id },
               data: {
                 productId: item.productId,
                 styleCode: item.styleCode,
                 productName: item.productName,
                 unitPrice: item.unitPrice,
                 quantity: item.quantity,
                 size: item.size,
                 material: item.material,
                 specialRequest: item.specialRequest
               }
             });
          }
        }
      }

      return order;
    });
  }

  async updatePacking(orderId, { packingNote, checklist }) {
    const packingRecord = await prisma.packing.findFirst({
      where: { orderId }
    });

    if (packingRecord) {
      return prisma.packing.update({
        where: { id: packingRecord.id },
        data: {
          packingNote,
          checklist
        }
      });
    } else {
      return prisma.packing.create({
        data: {
          orderId,
          packingNote,
          checklist
        }
      });
    }
  }

  async updateProduction(orderId, { productionNote, artisanNote }) {
    const productionRecord = await prisma.production.findFirst({
      where: { orderId }
    });

    if (productionRecord) {
      return prisma.production.update({
        where: { id: productionRecord.id },
        data: {
          productionNote,
          artisanNote
        }
      });
    } else {
      return prisma.production.create({
        data: {
          orderId,
          productionNote,
          artisanNote,
          generatedByAi: false
        }
      });
    }
  }

  async softDeleteOrder(id) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found.');

    const count = await prisma.order.count({
      where: { poNumber: order.poNumber }
    });
    if (count > 1) {
      throw new Error('Duplicate orders cannot be deleted.');
    }

    return prisma.order.delete({
      where: { id }
    });
  }

  async archiveOrder(id) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new Error('Order not found.');

    const count = await prisma.order.count({
      where: { poNumber: order.poNumber }
    });
    if (count > 1) {
      throw new Error('Duplicate orders cannot be archived.');
    }

    return prisma.order.update({
      where: { id },
      data: { isArchived: true }
    });
  }

  async restoreOrder(id) {
    return prisma.order.update({
      where: { id },
      data: { isDeleted: false, isArchived: false }
    });
  }
}

module.exports = new OrderRepository();

