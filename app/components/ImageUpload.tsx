'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'

interface ImageUploadProps {
  currentImage?: string
  onImageUpload: (url: string) => void
  onImageRemove?: () => void
}

export default function ImageUpload({ currentImage, onImageUpload, onImageRemove }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    // Upload to Supabase
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      // You'll need to create an API endpoint for this
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const { url } = await response.json()
      onImageUpload(url)
      // Clean up preview URL
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }, [onImageUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const handleRemove = () => {
    setPreview(null)
    if (onImageRemove) onImageRemove()
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative group">
          <div className="relative h-48 w-48 rounded-lg overflow-hidden border-2 border-gray-200">
            <Image
              src={preview}
              alt="Product preview"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? 'Drop the image here...'
              : 'Drag & drop a product image, or click to select'
            }
          </p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          {uploading && (
            <div className="mt-4">
              <div className="animate-pulse text-blue-600">Uploading...</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
