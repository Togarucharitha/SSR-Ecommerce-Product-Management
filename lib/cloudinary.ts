import { v2 as cloudinary } from 'cloudinary'

// Initialize Cloudinary at runtime (not at build time)
// This ensures env vars are available in the request handler
function initializeCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('[Cloudinary] Environment variables not fully configured')
    return false
  }
  
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    console.log('[Cloudinary] Initialized successfully with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME)
    return true
  } catch (error: any) {
    console.error('[Cloudinary] Failed to initialize:', error?.message)
    return false
  }
}

export { cloudinary }

/**
 * Upload a file to Cloudinary
 * In serverless environments (Railway, Vercel, etc.), base64 encoding is more reliable than streaming
 * @param file - File buffer or base64 string
 * @param folder - Optional folder path in Cloudinary
 * @returns Promise with the uploaded image URL
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string = 'products'
): Promise<string> {
  // Ensure Cloudinary is initialized at request time
  const initialized = initializeCloudinary()
  if (!initialized) {
    throw new Error('Cloudinary not configured: Missing environment variables')
  }

  return new Promise((resolve, reject) => {
    try {
      const uploadOptions = {
        folder,
        resource_type: 'image' as const,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      }

      let dataUri: string

      if (Buffer.isBuffer(file)) {
        // Convert buffer to base64 data URI for serverless compatibility
        // Base64 is more reliable than streams in Railway/serverless environments
        const base64 = file.toString('base64')
        dataUri = `data:image/jpeg;base64,${base64}`
        console.log('[Cloudinary uploadImage] Converting buffer to base64 data URI (', file.length, 'bytes)')
      } else if (typeof file === 'string') {
        // Already a string (base64 or data URI)
        dataUri = file
        console.log('[Cloudinary uploadImage] Using provided string upload')
      } else {
        throw new Error('Invalid file type: Expected Buffer or string')
      }

      // Use cloudinary.uploader.upload (not upload_stream) for serverless reliability
      cloudinary.uploader.upload(dataUri, uploadOptions, (error, result) => {
        if (error) {
          console.error('[Cloudinary uploadImage] Upload failed:', error?.message || error)
          reject(new Error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`))
        } else if (result?.secure_url) {
          console.log('[Cloudinary uploadImage] Success:', result.secure_url)
          resolve(result.secure_url)
        } else {
          reject(new Error('Upload returned no URL'))
        }
      })
    } catch (syncError: any) {
      console.error('[Cloudinary uploadImage] Synchronous error:', syncError?.message)
      reject(new Error(`Upload error: ${syncError?.message || 'Unknown error'}`))
    }
  })
}

/**
 * Delete an image from Cloudinary
 * @param imageUrl - The Cloudinary URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Ensure Cloudinary is initialized at request time
    initializeCloudinary()
    
    // Extract public_id from Cloudinary URL
    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.\w+$/)
    if (publicIdMatch) {
      const publicId = publicIdMatch[1]
      console.log('[Cloudinary deleteImage] Deleting image:', publicId)
      await cloudinary.uploader.destroy(publicId)
      console.log('[Cloudinary deleteImage] Image deleted successfully:', publicId)
    }
  } catch (error: any) {
    console.error('[Cloudinary deleteImage] Error:', error?.message)
    // Don't throw - image deletion failure shouldn't break the flow
  }
}

