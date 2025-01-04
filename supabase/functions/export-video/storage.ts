// Upload file to Supabase Storage
export const uploadToStorage = async (
  supabaseAdmin: any,
  fileName: string,
  data: ArrayBuffer,
  contentType: string
) => {
  console.log(`Uploading ${contentType} to Storage...`);
  const blob = new Blob([data], { type: contentType });
  const { data: uploadData, error } = await supabaseAdmin
    .storage
    .from('exports')
    .upload(fileName, blob, {
      contentType,
      upsert: true
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  return uploadData;
};