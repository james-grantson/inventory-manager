'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  existingImage?: string
  onRemove?: () => void
}

export default function ImageUpload({ onImageUploaded, existingImage, onRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingImage || null)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, GIF, etc.)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError('')
    setUploading(true)
    setUploadProgress(0)

    try {
      // Create local preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      console.log(' Uploading to Supabase...', { bucket: 'product-images', filePath })

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Supabase upload error:', uploadError)
        throw new Error(uploadError.message)
      }

      console.log('✅ Upload successful:', data)

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      console.log('✅ Public URL:', publicUrl)

      // Clean up preview URL
      URL.revokeObjectURL(objectUrl)
      
      setPreview(publicUrl)
      setUploadProgress(100)
      
      // Notify parent
      onImageUploaded(publicUrl)
      
    } catch (err: any) {
      console.error(' Upload error:', err)
      setError(`Upload failed: ${err.message || 'Unknown error'}`)
      setPreview(existingImage || null)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Product Image
      </label>
      
      <div className="flex items-start gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {/* Preview or Upload Area */}
        <div className="relative">
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove image"
                disabled={uploading}
              >
                <X className="h-3 w-3" />
              </button>
              
              {/* Upload Progress */}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="text-white text-xs font-medium">
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={uploading}
              className="w-32 h-32 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-500 dark:hover:border-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Click to upload</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Status Messages */}
        <div className="flex-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Upload Failed</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}
          
          {!preview && !uploading && !error && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported: JPG, PNG, GIF, WebP (max 5MB)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
