const supabase = require('../config/supabase');

/**
 * Uploads a file buffer to Supabase Storage bucket.
 * @param {Object} file - Multer file object from req.file
 * @param {string} bucketName - Name of the Supabase storage bucket
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
exports.uploadFile = async (file, bucketName = 'purchase-orders') => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;
    const filePath = `po/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw new Error(`Failed to upload file to storage: ${error.message}`);
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Storage service error:', error);
    throw error;
  }
};
