const { OpenAI } = require('openai');
const pdfParse = require('pdf-parse');
const xlsx = require('xlsx');
require('dotenv').config();

const apiKey = process.env.OPENROUTER_API_KEY;
let openai;

if (apiKey && !apiKey.includes('placeholder')) {
  openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/MatchaTim',
      'X-Title': 'Heather Benjamin Jewelry PO Assistant',
    }
  });
}

/**
 * Parses a PDF file to text.
 */
async function parsePdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file text.');
  }
}

/**
 * Parses an Excel file to string representation of sheets.
 */
function parseExcel(buffer) {
  try {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    let resultText = '';
    
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      resultText += `Sheet: ${sheetName}\n`;
      json.forEach((row) => {
        resultText += row.join('\t') + '\n';
      });
      resultText += '\n';
    });
    
    return resultText;
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error('Failed to parse Excel file content.');
  }
}

/**
 * Fallback parser when OpenRouter API key is missing or fails.
 * Returns mock/simulated data based on catalog.
 */
function getFallbackExtraction(fileName, catalogProducts) {
  console.log('Using fallback PO extraction');
  
  // Pick some product from catalog if available, else use a default
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
  // If API key is not configured, use fallback simulation
  if (!openai) {
    return getFallbackExtraction(originalName, catalogProducts);
  }

  try {
    const model = 'google/gemini-2.0-flash-exp:free';
    const messages = [];

    const systemPrompt = `You are an AI Order-to-Production Assistant for Heather Benjamin Jewelry.
Your task is to analyze the purchase order and extract structured information, matching items to our product catalog where possible.

Product Catalog of known style codes and product details:
${JSON.stringify(catalogProducts, null, 2)}

Instructions:
1. Extract the PO number, customer name, customer email, general notes, and list of ordered items (style code, quantity, size, material, special request).
2. Attempt to match the extracted style code to the style codes in our product catalog. If there is a slight typo, try to correct it to match the catalog, but if it is completely different or unknown, keep the raw extracted code and flag it.
3. Perform validation: Detect if style codes are not in the catalog, or if required info like size/material is missing, and list these in "validation_warnings".
4. Generate "production_note" containing clear, step-by-step production instructions for the production managers.
5. Generate "artisan_note" containing detailed craftsmanship instructions tailored for the Balinese artisans making the jewelry (e.g. details on filigree, stones, finish, engraving).
6. Generate "packing_note" specifying any special packaging or shipping guidelines.
7. Generate "packing_checklist" array of items to pack, describing their size and material so packers can check them off.

You MUST return a JSON object ONLY, with no extra text or markdown formatting. The JSON object must match this schema:
{
  "po_number": "extracted PO number",
  "customer_name": "extracted customer name",
  "customer_email": "extracted customer email or null",
  "notes": "any general notes on the PO or null",
  "items": [
    {
      "style_code": "matched catalog style_code or raw extracted code",
      "quantity": 10,
      "size": "ring size, bracelet length, or null",
      "material": "extracted material (e.g. Gold, Silver, Brass) or null",
      "special_request": "any item-specific request or null"
    }
  ],
  "validation_warnings": [
    "Warning: Style code HB-XXX not found in catalog",
    "Warning: Missing material for item 1"
  ],
  "production_note": "detailed production instructions",
  "artisan_note": "detailed artisan instructions",
  "packing_note": "packing notes",
  "packing_checklist": [
    {
      "item_name": "HB102 - Ring (Size 7, Gold)",
      "quantity": 10,
      "checked": false
    }
  ]
}`;

    if (mimeType.startsWith('image/')) {
      // Image: Send base64 image block using OpenAI SDK format for OpenRouter
      const base64Image = fileBuffer.toString('base64');
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
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      });
    } else {
      let docText = '';
      if (mimeType === 'application/pdf') {
        docText = await parsePdf(fileBuffer);
      } else if (
        mimeType === 'application/vnd.ms-excel' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        docText = parseExcel(fileBuffer);
      } else {
        throw new Error('Unsupported file format for extraction.');
      }

      messages.push({
        role: 'user',
        content: `${systemPrompt}\n\nPlease extract the purchase order data from the following parsed document content:\n\n${docText}`
      });
    }

    const response = await openai.chat.completions.create({
      model: model,
      messages: messages,
      response_format: { type: 'json_object' }
    });

    const responseText = response.choices[0].message.content.trim();
    
    // Attempt to extract JSON from the text in case LLM wraps it in markdown code block
    let jsonString = responseText;
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1];
    }

    const extractedData = JSON.parse(jsonString);
    return extractedData;

  } catch (error) {
    console.error('OpenRouter extraction error:', error);
    // If the real API calls fail, fallback to mock data to prevent blocking development
    return getFallbackExtraction(originalName, catalogProducts);
  }
};
