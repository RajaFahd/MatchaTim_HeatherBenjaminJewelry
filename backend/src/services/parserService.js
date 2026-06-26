const { PDFParse } = require('pdf-parse');
const xlsx = require('xlsx');

/**
 * Parsers for different file types.
 */
class ParserService {
  /**
   * Parse PDF file to text.
   * @param {Buffer} buffer 
   * @returns {Promise<string>}
   */
  async parsePdf(buffer) {
    try {
      const uint8Array = new Uint8Array(buffer);
      const pdf = new PDFParse(uint8Array);
      const data = await pdf.getText();
      return data.text;
    } catch (error) {
      console.error('PDF parsing error in parserService:', error);
      throw new Error('Failed to extract text from PDF file. Make sure it is not corrupted or scanned without OCR.');
    }
  }

  /**
   * Parse Excel/CSV spreadsheets to a readable JSON tabbed text format.
   * @param {Buffer} buffer 
   * @returns {string}
   */
  parseExcel(buffer) {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let resultText = '';
      
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        resultText += `Sheet: ${sheetName}\n`;
        json.forEach((row) => {
          if (Array.isArray(row)) {
            resultText += row.join('\t') + '\n';
          }
        });
        resultText += '\n';
      });
      
      return resultText;
    } catch (error) {
      console.error('Excel parsing error in parserService:', error);
      throw new Error('Failed to extract data from spreadsheet. Check if the file is valid.');
    }
  }

  /**
   * Parse plain text documents.
   * @param {Buffer} buffer 
   * @returns {string}
   */
  parseText(buffer) {
    return buffer.toString('utf-8');
  }

  /**
   * Prepare image data for Gemini Vision API.
   * Returns base64 representation and mimeType.
   * @param {Buffer} buffer 
   * @param {string} mimeType 
   * @returns {Object}
   */
  prepareImage(buffer, mimeType) {
    const base64Data = buffer.toString('base64');
    return {
      isImage: true,
      mimeType,
      base64Data
    };
  }

  /**
   * Dispatcher: detect format and parse.
   * @param {Buffer} buffer 
   * @param {string} mimeType 
   * @returns {Promise<string|Object>}
   */
  async parseFile(buffer, mimeType) {
    if (!buffer) {
      throw new Error('File buffer is empty.');
    }

    if (mimeType === 'application/pdf') {
      return await this.parsePdf(buffer);
    } 
    
    if (
      mimeType === 'application/vnd.ms-excel' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'text/csv'
    ) {
      return this.parseExcel(buffer);
    } 
    
    if (mimeType.startsWith('image/')) {
      return this.prepareImage(buffer, mimeType);
    } 
    
    if (mimeType === 'text/plain') {
      return this.parseText(buffer);
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

module.exports = new ParserService();
