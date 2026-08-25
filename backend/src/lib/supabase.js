import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";

// Initialize Supabase Client using backend-only service role key
const supabaseUrl = env.supabaseUrl;
const supabaseServiceRoleKey = env.supabaseServiceRoleKey;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const BUCKET_NAME = "course-materials";

/**
 * Uploads a file buffer to Supabase Storage.
 * @param {string} path - The destination path in the bucket.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} mimetype - The file MIME type.
 * @returns {Promise<string>} - The storage path.
 */
export async function uploadPDFToStorage(path, buffer, mimetype) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }
  return data.path;
}

/**
 * Downloads a file buffer from Supabase Storage.
 * @param {string} path - The path of the file in the bucket.
 * @returns {Promise<Buffer>} - The file buffer.
 */
export async function downloadPDFFromStorage(path) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path);

  if (error) {
    throw new Error(`Supabase download failed: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Deletes a file from Supabase Storage.
 * @param {string} path - The path of the file to delete.
 */
export async function deletePDFFromStorage(path) {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error(`[Supabase Cleanup] Failed to delete file ${path}:`, error.message);
  }
}
