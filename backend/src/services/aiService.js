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
  console.log('✅ Gemini AI Studio client initialized');
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
  console.log('✅ OpenRouter client initialized');
}

/**
 * Fallback parser when all AI API calls fail.
 * Returns mock/simulated data based on catalog.
 */
function getFallbackExtraction(fileName, catalogProducts) {
  console.log('⚠️  Using FALLBACK PO extraction (no AI). Data will NOT match the uploaded file.');
  
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
    validation_warnings: ['⚠️ This is FALLBACK data. AI extraction failed. Please re-upload.'],
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
 * Sleep utility for retry backoff.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * The JSON schema for structured AI output.
 */
const PO_JSON_SCHEMA = {
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
};

/**
 * Attempt a completion call with retry on rate limit (429).
 * @param {Object} client - OpenAI-compatible client
 * @param {string} model - Model identifier
 * @param {Array} messages - Chat messages
 * @param {Object} responseFormat - The response_format to use
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<string>} - The response text
 */
async function callWithRetry(client, model, messages, responseFormat, maxRetries = 2, maxTokens = null) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const params = {
        model,
        messages,
        response_format: responseFormat
      };
      if (maxTokens) {
        params.max_tokens = maxTokens;
      }
      const response = await client.chat.completions.create(params);
      return response.choices[0].message.content.trim();
    } catch (err) {
      const isRateLimit = err.status === 429 || (err.message && err.message.includes('429'));
      if (isRateLimit && attempt < maxRetries) {
        const waitTime = (attempt + 1) * 5000; // 5s, 10s
        console.warn(`⏳ Rate limited (429). Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await sleep(waitTime);
        continue;
      }
      throw err;
    }
  }
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
    console.warn('❌ No AI API keys configured. Using fallback.');
    return getFallbackExtraction(originalName, catalogProducts);
  }

  // 1. Parse file content
  console.log(`📄 Parsing file: ${originalName} (${mimeType})`);
  let parsedResult;
  try {
    parsedResult = await parserService.parseFile(fileBuffer, mimeType);
  } catch (parseErr) {
    console.error('❌ File parsing failed:', parseErr.message);
    throw new Error(`File parsing failed: ${parseErr.message}`);
  }

  // Log what we parsed
  if (parsedResult && parsedResult.isImage) {
    console.log(`🖼️  Image detected (${parsedResult.mimeType}), sending as base64 to AI vision model.`);
  } else {
    const textPreview = typeof parsedResult === 'string' ? parsedResult.substring(0, 300) : JSON.stringify(parsedResult).substring(0, 300);
    console.log(`📝 Parsed text (${typeof parsedResult === 'string' ? parsedResult.length : '?'} chars). Preview:\n${textPreview}...`);
  }

  // 2. Build messages
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

  // 3. Try AI clients with retry
  let responseText = null;

  // Try Gemini first
  if (geminiClient) {
    try {
      console.log('🤖 Attempting extraction via Gemini Studio (gemini-2.5-flash)...');
      responseText = await callWithRetry(geminiClient, 'gemini-2.5-flash', messages, PO_JSON_SCHEMA, 2);
      console.log('✅ Gemini extraction successful.');
    } catch (err) {
      console.warn(`⚠️  Gemini failed: ${err.status || ''} ${err.message}`);
    }
  }

  // Fallback to OpenRouter
  if (!responseText && openRouterClient) {
    try {
      console.log('🤖 Attempting extraction via OpenRouter (google/gemini-2.5-flash)...');
      responseText = await callWithRetry(openRouterClient, 'google/gemini-2.5-flash', messages, { type: 'json_object' }, 2, 8000);
      console.log('✅ OpenRouter extraction successful.');
    } catch (err) {
      console.warn(`⚠️  OpenRouter failed: ${err.status || ''} ${err.message}`);
    }
  }

  if (!responseText) {
    console.error('❌ All AI clients failed after retries. Using fallback mock data.');
    return getFallbackExtraction(originalName, catalogProducts);
  }

  // 4. Parse AI JSON response
  try {
    let jsonString = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    const extractedData = JSON.parse(jsonString);
    
    // Log extraction summary
    const productCount = extractedData.products?.length || 0;
    console.log(`✅ AI extracted PO: ${extractedData.po_number}, Customer: ${extractedData.customer?.name}, Products: ${productCount}`);
    
    return extractedData;
  } catch (parseError) {
    console.error('❌ Failed to parse AI JSON response:', parseError.message);
    console.error('Raw response (first 500 chars):', responseText.substring(0, 500));
    return getFallbackExtraction(originalName, catalogProducts);
  }
};
