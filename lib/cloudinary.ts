import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Optional folder path in Cloudinary
 * @returns Promise with the uploaded image URL
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string = 'products'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image' as const,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    }

    if (Buffer.isBuffer(file)) {
      cloudinary.uploader
        .upload_stream(uploadOptions, (error, result) => {
          if (error) {
            reject(error)
          } else if (result) {
            resolve(result.secure_url)
          } else {
            reject(new Error('Upload failed: No result returned'))
          }
        })
        .end(file)
    } else {
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve(result.secure_url)
        } else {
          reject(new Error('Upload failed: No result returned'))
        }
      })
    }
  })
}

/**
 * Delete an image from Cloudinary
 * @param imageUrl - The Cloudinary URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from Cloudinary URL
    const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.\w+$/)
    if (publicIdMatch) {
      const publicId = publicIdMatch[1]
      await cloudinary.uploader.destroy(publicId)
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    // Don't throw - image deletion failure shouldn't break the flow
  }
}

