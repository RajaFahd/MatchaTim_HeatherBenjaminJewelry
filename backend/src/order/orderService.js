const orderRepository = require('./orderRepository');
const productRepository = require('../product/productRepository');
const storageService = require('../services/storageService');
const aiService = require('../services/aiService');

class OrderService {
  async uploadOrder(file) {
    if (!file) {
      throw new Error('Please upload a Purchase Order file (PDF, Excel, or Image).');
    }

    // 1. Fetch current product catalog for AI matching
    const products = await productRepository.findAll();

    // 2. Upload file to Supabase Storage
    let fileUrl = '';
    try {
      fileUrl = await storageService.uploadFile(file, 'purchase-orders');
    } catch (storageError) {
      console.warn('Storage upload failed, continuing with mock file path:', storageError.message);
      fileUrl = `https://mock-storage.supabase.co/po/${Date.now()}-${file.originalname}`;
    }

    // 3. Extract and validate data using AI (Claude Vision / Text Parser)
    const aiResult = await aiService.extractPurchaseOrder(
      file.buffer,
      file.mimetype,
      file.originalname,
      products || []
    );

    // 4. Construct Order Data
    const orderData = {
      poNumber: aiResult.po_number || 'UNKNOWN-PO',
      customerName: aiResult.customer_name || 'Unknown Customer',
      customerEmail: aiResult.customer_email || null,
      uploadFile: fileUrl,
      notes: aiResult.notes || null,
      status: 'Uploaded'
    };

    // 5. Construct Order Items Data
    let itemsData = [];
    if (aiResult.items && aiResult.items.length > 0) {
      itemsData = aiResult.items.map(item => {
        // Find matching product in catalog
        const matchedProduct = products?.find(
          p => p.styleCode.toLowerCase().replace(/[\s-_]/g, '') === item.style_code.toLowerCase().replace(/[\s-_]/g, '')
        );

        return {
          productId: matchedProduct ? matchedProduct.id : null,
          quantity: item.quantity || 1,
          size: item.size ? String(item.size) : null,
          material: item.material || (matchedProduct ? matchedProduct.material : null),
          specialRequest: item.special_request || null
        };
      });
    }

    // 6. Construct Production Data
    const productionData = {
      productionNote: aiResult.production_note || '',
      artisanNote: aiResult.artisan_note || '',
      generatedByAi: true
    };

    // 7. Construct Packing Data
    const packingData = {
      packingNote: aiResult.packing_note || '',
      checklist: aiResult.packing_checklist || [],
      generatedByAi: true
    };

    // 8. Save all details inside database using single transaction
    const order = await orderRepository.createOrderWithDetails({
      orderData,
      itemsData,
      productionData,
      packingData
    });

    return {
      ...order,
      validation_warnings: aiResult.validation_warnings || []
    };
  }

  async getAllOrders(status) {
    return orderRepository.findAll(status);
  }

  async getOrderDetails(id) {
    const order = await orderRepository.findDetails(id);
    if (!order) {
      throw new Error('Order not found.');
    }
    return order;
  }

  async updateOrderStatus(id, status) {
    const validStatuses = ['Uploaded', 'Reviewed', 'Production', 'QC', 'Packing', 'Shipping', 'Completed'];

    if (!status || !validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return orderRepository.updateStatus(id, status);
  }
}

module.exports = new OrderService();
