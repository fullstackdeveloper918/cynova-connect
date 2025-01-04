import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

export const uploadToStorage = async (
  fileName: string,
  data: ArrayBuffer,
  contentType: string,
  supabaseUrl: string,
  supabaseKey: string
) => {
  const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const { data: uploadData, error: uploadError } = await supabaseAdmin
    .storage
    .from('exports')
    .upload(fileName, data, {
      contentType,
      upsert: true
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabaseAdmin
    .storage
    .from('exports')
    .getPublicUrl(fileName);

  return publicUrl;
};