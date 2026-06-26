const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.warn('Warning: SUPABASE_URL is not set or is using placeholder.');
}
if (!supabaseKey || supabaseKey.includes('placeholder')) {
  console.warn('Warning: SUPABASE_KEY is not set or is using placeholder.');
}

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

module.exports = supabase;
