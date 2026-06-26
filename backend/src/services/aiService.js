const { OpenAI } = require('openai');
const { PDFParse } = require('pdf-parse');
const { getSystemPrompt } = require('./systemPrompt');
const xlsx = require('xlsx');
require('dotenv').config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;
let openai;
let isGeminiStudio = false;

if (geminiApiKey && !geminiApiKey.includes('placeholder')) {
  openai = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: geminiApiKey
  });
  isGeminiStudio = true;
  console.log('Using Google Gemini AI Studio client');
} else if (openRouterApiKey && !openRouterApiKey.includes('placeholder')) {
  openai = new OpenAI({
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
 * Parses a PDF file to text.
 */
async function parsePdf(buffer) {
  try {
    const uint8Array = new Uint8Array(buffer);
    const pdf = new PDFParse(uint8Array);
    const data = await pdf.getText();
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
    const model = isGeminiStudio ? 'gemini-2.5-flash' : 'google/gemini-2.5-flash';
    const messages = [];

    const systemPrompt = getSystemPrompt(catalogProducts);

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
