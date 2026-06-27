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
    const poNumber = aiResult.po_number || 'UNKNOWN-PO';
    const customerName = aiResult.customer?.name || aiResult.customer_name || 'Unknown Customer';
    const customerEmail = aiResult.customer?.email || aiResult.customer_email || null;
    const notes = aiResult.notes || (aiResult.special_instructions && aiResult.special_instructions.length > 0 ? aiResult.special_instructions.join('. ') : null);

    const orderData = {
      poNumber,
      customerName,
      customerEmail,
      uploadFile: fileUrl,
      notes,
      status: 'Uploaded'
    };

    // 5. Construct Order Items Data
    let itemsData = [];
    const rawItems = aiResult.products || aiResult.items || [];
    if (rawItems.length > 0) {
      itemsData = rawItems.map(item => {
        // Find matching product in catalog
        const matchedProduct = products?.find(
          p => p.styleCode.toLowerCase().replace(/[\s-_]/g, '') === item.style_code.toLowerCase().replace(/[\s-_]/g, '')
        );

        return {
          productId: matchedProduct ? matchedProduct.id : null,
          styleCode: item.style_code || (matchedProduct ? matchedProduct.styleCode : 'UNKNOWN'),
          productName: item.product_name || (matchedProduct ? matchedProduct.productName : 'UNKNOWN'),
          unitPrice: item.unit_price || (matchedProduct ? Number(matchedProduct.wholesalePrice) : 0),
          quantity: item.quantity || 1,
          size: item.size ? String(item.size) : null,
          material: item.material || (matchedProduct ? matchedProduct.material : null),
          specialRequest: item.special_notes || item.special_request || null
        };
      });
    }

    // 6. Construct Production Data
    let productionNote = aiResult.production_note || '';
    if (!productionNote && aiResult.production_notes) {
      const parts = [];
      if (aiResult.production_notes.urgent_items?.length) parts.push(`Urgent: ${aiResult.production_notes.urgent_items.join(', ')}`);
      if (aiResult.production_notes.custom_requests?.length) parts.push(`Custom Requests: ${aiResult.production_notes.custom_requests.join(', ')}`);
      if (aiResult.production_notes.fragile_items?.length) parts.push(`Fragile: ${aiResult.production_notes.fragile_items.join(', ')}`);
      productionNote = parts.join('\n');
    }
    const artisanNote = aiResult.artisan_note || (aiResult.products?.map(p => `${p.style_code}: Finish - ${p.finish || 'Standard'}`).join('\n') || '');

    const productionData = {
      productionNote,
      artisanNote,
      generatedByAi: true
    };

    // 7. Construct Packing Data
    let packingNote = aiResult.packing_note || '';
    if (!packingNote && aiResult.packing_guide) {
      const parts = [];
      if (aiResult.packing_guide.carton_label) parts.push(`Carton Label: ${aiResult.packing_guide.carton_label}`);
      if (aiResult.packing_guide.shipping_method) parts.push(`Shipping: ${aiResult.packing_guide.shipping_method}`);
      packingNote = parts.join('\n');
    }

    let checklist = [];
    if (aiResult.packing_checklist) {
      checklist = aiResult.packing_checklist;
    } else if (aiResult.packing_guide?.items) {
      checklist = aiResult.packing_guide.items.map(item => ({
        item_name: `${item.style_code} - ${item.product_name}`,
        quantity: item.quantity || 1,
        checked: false
      }));
    }

    const packingData = {
      packingNote,
      checklist,
      generatedByAi: true
    };

    // 8. Save all details inside database using single transaction
    const order = await orderRepository.upsertOrderWithDetails({
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

  async getAllOrders(filters) {
    return orderRepository.findAll(filters);
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

  async updateOrder(id, data) {
    const products = await productRepository.findAll();

    const orderData = {
      poNumber: data.poNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      notes: data.notes
    };

    let itemsData = [];
    if (data.items && data.items.length > 0) {
      itemsData = data.items.map(item => {
        let productId = item.productId || null;

        if (item.styleCode) {
          const matchedProduct = products?.find(
            p => p.styleCode.toLowerCase().replace(/[\s-_]/g, '') === item.styleCode.toLowerCase().replace(/[\s-_]/g, '')
          );
          if (matchedProduct) {
            productId = matchedProduct.id;
          }
        }

        return {
          id: item.id,
          productId,
          styleCode: item.styleCode,
          productName: item.productName || null,
          unitPrice: item.unitPrice ? parseFloat(item.unitPrice) : null,
          quantity: item.quantity ? parseInt(item.quantity) : 1,
          size: item.size ? String(item.size) : null,
          material: item.material || null,
          specialRequest: item.specialRequest || null
        };
      });
    }

    return orderRepository.updateOrderWithDetails(id, { orderData, itemsData });
  }

  async updatePacking(orderId, { packingNote, checklist }) {
    return orderRepository.updatePacking(orderId, { packingNote, checklist });
  }

  async updateProduction(orderId, { productionNote, artisanNote }) {
    return orderRepository.updateProduction(orderId, { productionNote, artisanNote });
  }

  async softDeleteOrder(id) {
    return orderRepository.softDeleteOrder(id);
  }

  async archiveOrder(id) {
    return orderRepository.archiveOrder(id);
  }

  async restoreOrder(id) {
    return orderRepository.restoreOrder(id);
  }
}

module.exports = new OrderService();

