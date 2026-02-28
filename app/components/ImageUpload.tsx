'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

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

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const { url } = await response.json()
      onImageUpload(url)
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
    maxSize: 5 * 1024 * 1024
  })

  const handleRemove = () => {
    setPreview(null)
    if (onImageRemove) onImageRemove()
  }

  if (preview) {
    return (
      <div className="border rounded-lg p-4">
        <div className="mb-3">
          <img src={preview} alt="Preview" className="max-h-48 rounded" />
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
        >
          Remove Image
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        `}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? 'Drop the image here...'
            : 'Drag & drop an image, or click to select'
          }
        </p>
        <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
      </div>
      {uploading && (
        <div className="mt-3 text-sm text-blue-600">Uploading...</div>
      )}
    </div>
  )
}
