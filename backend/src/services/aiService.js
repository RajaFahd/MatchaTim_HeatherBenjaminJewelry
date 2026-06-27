const { OpenAI } = require('openai');
const parserService = require('./parserService');
const { getSystemPrompt } = require('./systemPrompt');
require('dotenv').config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
let geminiClient = null;
let openRouterClient = null;

if (geminiApiKey && !geminiApiKey.includes('placeholder')) {
  geminiClient = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: geminiApiKey
  });
  console.log('Using Google Gemini AI Studio client');
}

if (openRouterApiKey && !openRouterApiKey.includes('placeholder')) {
  openRouterClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: openRouterApiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/MatchaTim',
      'X-Title': 'Heather Benjamin Jewelry PO Assistant',
    }
  });
  console.log('Using OpenRouter client');
}

/**
 * Fallback parser when OpenRouter API key is missing or fails.
 * Returns mock/simulated data based on catalog.
 */
function getFallbackExtraction(fileName, catalogProducts) {
  console.log('Using fallback PO extraction');
  
  const catalogProduct = catalogProducts && catalogProducts.length > 0
    ? catalogProducts[0]
    : { style_code: 'HB102', product_name: 'Classic Gold Ring', material: 'Gold' };

  const styleCode = catalogProduct.style_code;

  return {
    po_number: `PO-${Date.now().toString().slice(-6)}`,
    customer_name: 'Indo Collection Corp',
    customer_email: 'info@indocollection.com',
    notes: 'Please expedite if possible. Balinese packaging requested.',
    items: [
      {
        style_code: styleCode,
        quantity: 15,
        size: '7',
        material: catalogProduct.material || 'Gold',
        special_request: 'Custom engraving "HB"'
      }
    ],
    validation_warnings: [],
    production_note: `Produce 15 units of ${catalogProduct.product_name} (${styleCode}). Verify standard gold purity.`,
    artisan_note: `Balinese filigree pattern must be clean. Engrave "HB" inside the band.`,
    packing_note: `Pack in custom wooden boxes with Heather Benjamin logo. Double check engraving.`,
    packing_checklist: [
      {
        item_name: `${styleCode} - ${catalogProduct.product_name} (Size 7, Gold)`,
        quantity: 15,
        checked: false
      }
    ]
  };
}

/**
 * Main AI PO extraction service.
 * @param {Buffer} fileBuffer - The file content
 * @param {string} mimeType - The file mime type
 * @param {string} originalName - Original filename
 * @param {Array} catalogProducts - Current list of products from DB
 */
exports.extractPurchaseOrder = async (fileBuffer, mimeType, originalName, catalogProducts = []) => {
  // If no API key is configured, use fallback simulation
  if (!geminiClient && !openRouterClient) {
    return getFallbackExtraction(originalName, catalogProducts);
  }

  // 1. Run file parsing via parserService
  const parsedResult = await parserService.parseFile(fileBuffer, mimeType);

  // 2. Prepare message body based on parser output type
  const systemPrompt = getSystemPrompt(catalogProducts);
  const messages = [];

  if (parsedResult && parsedResult.isImage) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'text',
          text: `${systemPrompt}\n\nPlease extract the purchase order data from the attached image.`
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${parsedResult.mimeType};base64,${parsedResult.base64Data}`
          }
        }
      ]
    });
  } else {
    messages.push({
      role: 'user',
      content: `${systemPrompt}\n\nPlease extract the purchase order data from the following parsed document content:\n\n${parsedResult}`
    });
  }

  // Helper to execute completion
  const runCompletion = async (client, model) => {
    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'po_extraction',
          schema: {
            type: 'object',
            properties: {
              po_number: { type: 'string' },
              order_date: { type: 'string' },
              ship_date: { type: 'string' },
              payment_terms: { type: 'string' },
              customer: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  contact_person: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  bill_to_address: { type: 'string' },
                  ship_to_address: { type: 'string' }
                }
              },
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    style_code: { type: 'string' },
                    product_name: { type: 'string' },
                    material: { type: 'string' },
                    finish: { type: 'string' },
                    size: { type: 'string' },
                    unit_price: { type: 'number' },
                    quantity: { type: 'integer' },
                    subtotal: { type: 'number' },
                    special_notes: { type: 'string' }
                  }
                }
              },
              order_summary: {
                type: 'object',
                properties: {
                  total_skus: { type: 'integer' },
                  total_units: { type: 'integer' },
                  order_total: { type: 'number' },
                  currency: { type: 'string' },
                  shipping_method: { type: 'string' }
                }
              },
              special_instructions: {
                type: 'array',
                items: { type: 'string' }
              },
              production_notes: {
                type: 'object',
                properties: {
                  urgent_items: { type: 'array', items: { type: 'string' } },
                  gift_items: { type: 'array', items: { type: 'string' } },
                  fragile_items: { type: 'array', items: { type: 'string' } },
                  custom_requests: { type: 'array', items: { type: 'string' } }
                }
              },
              packing_guide: {
                type: 'object',
                properties: {
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        style_code: { type: 'string' },
                        product_name: { type: 'string' },
                        quantity: { type: 'integer' },
                        packaging_type: { type: 'string' },
                        special_handling: { type: 'string' }
                      }
                    }
                  },
                  carton_label: { type: 'string' },
                  shipping_method: { type: 'string' },
                  tracking_required: { type: 'boolean' }
                }
              },
              missing_info: {
                type: 'array',
                items: { type: 'string' }
              },
              flags: {
                type: 'array',
                items: { type: 'string' }
              },
              validation: {
                type: 'object',
                properties: {
                  subtotals_match: { type: 'boolean' },
                  total_correct: { type: 'boolean' },
                  all_style_codes_present: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    });
    return response.choices[0].message.content.trim();
  };

  let responseText = null;

  // Try Gemini API first
  if (geminiClient) {
    try {
      console.log('Attempting AI extraction via Google Gemini Studio...');
      responseText = await runCompletion(geminiClient, 'gemini-2.5-flash');
    } catch (err) {
      console.warn('Gemini Studio extraction failed or rate-limited:', err.message);
    }
  }

  // Fallback to OpenRouter if Gemini failed
  if (!responseText && openRouterClient) {
    try {
      console.log('Attempting AI extraction via OpenRouter (google/gemini-2.5-flash)...');
      responseText = await runCompletion(openRouterClient, 'google/gemini-2.5-flash');
    } catch (err) {
      console.warn('OpenRouter extraction failed:', err.message);
    }
  }

  if (!responseText) {
    console.warn('All AI clients failed. Falling back to mock extraction.');
    return getFallbackExtraction(originalName, catalogProducts);
  }

  try {
    let jsonString = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    const extractedData = JSON.parse(jsonString);
    return extractedData;
  } catch (parseError) {
    console.error('Error parsing AI JSON response:', parseError);
    return getFallbackExtraction(originalName, catalogProducts);
  }
};
