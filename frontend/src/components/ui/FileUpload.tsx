import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  maxFiles?: number
  onUpload?: (files: File[]) => Promise<void>
  onFileSelect?: (files: File[]) => void
  className?: string
  disabled?: boolean
  showPreview?: boolean
}

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
  preview?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = '*/*',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  onUpload,
  onFileSelect,
  className,
  disabled = false,
  showPreview = true
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)} limit`
    }
    
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const fileType = file.type
      const fileName = file.name.toLowerCase()
      
      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return fileName.endsWith(acceptedType.toLowerCase())
        }
        return fileType === acceptedType || fileType.startsWith(acceptedType.replace('*', ''))
      })
      
      if (!isAccepted) {
        return `File type not accepted. Allowed types: ${accept}`
      }
    }
    
    return null
  }

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    if (!multiple && fileArray.length > 1) {
      alert('Only one file is allowed')
      return
    }
    
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles: UploadedFile[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        const uploadedFile: UploadedFile = {
          file,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          preview: showPreview && file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        }
        validFiles.push(uploadedFile)
      }
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles])
      onFileSelect?.(validFiles.map(f => f.file))
      
      // Auto-upload if onUpload is provided
      if (onUpload) {
        handleUpload(validFiles)
      }
    }
  }, [multiple, maxFiles, maxSize, accept, showPreview, uploadedFiles, onFileSelect, onUpload])

  const handleUpload = async (files: UploadedFile[]) => {
    setIsUploading(true)
    
    // Update status to uploading
    setUploadedFiles(prev => 
      prev.map(f => 
        files.find(uf => uf.id === f.id) 
          ? { ...f, status: 'uploading' as const, progress: 0 }
          : f
      )
    )

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadedFiles(prev => 
          prev.map(f => 
            files.find(uf => uf.id === f.id) && f.status === 'uploading'
              ? { ...f, progress: i }
              : f
          )
        )
      }

      // Complete upload
      await onUpload?.(files.map(f => f.file))
      
      setUploadedFiles(prev => 
        prev.map(f => 
          files.find(uf => uf.id === f.id)
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        )
      )
    } catch (error) {
      setUploadedFiles(prev => 
        prev.map(f => 
          files.find(uf => uf.id === f.id)
            ? { ...f, status: 'error' as const, error: 'Upload failed' }
            : f
        )
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [disabled, handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const retryUpload = (file: UploadedFile) => {
    handleUpload([file])
  }

  return (
    <div className={twMerge('space-y-4', className)}>
      {/* Upload Area */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={twMerge(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
          isDragOver
            ? 'border-primary-500 bg-primary-500/10 scale-[1.02]'
            : 'border-border/50 bg-surface-100/30 hover:border-primary-500/50 hover:bg-surface-200/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          {/* Icon */}
          <motion.div
            animate={isDragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center"
          >
            <CloudArrowUpIcon className="w-8 h-8 text-white" />
          </motion.div>

          {/* Text */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {isDragOver ? 'Drop files here' : 'Upload files'}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Drag and drop files here, or click to browse
            </p>
            
            {/* Constraints */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-text-muted">
              <span>Max {formatFileSize(maxSize)}</span>
              {maxFiles > 1 && <span>Max {maxFiles} files</span>}
              {accept !== '*/*' && <span>{accept}</span>}
            </div>
          </div>

          {/* Browse Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Browse Files
          </motion.button>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            {uploadedFiles.map((uploadedFile) => (
              <motion.div
                key={uploadedFile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3 p-3 glass border border-border/50 rounded-lg"
              >
                {/* File Icon/Preview */}
                <div className="w-10 h-10 flex-shrink-0">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-200 rounded-lg flex items-center justify-center">
                      <DocumentIcon className="w-5 h-5 text-text-muted" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text-primary truncate">
                    {uploadedFile.file.name}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-text-muted">
                    <span>{formatFileSize(uploadedFile.file.size)}</span>
                    <span>·</span>
                    <span>{uploadedFile.file.type || 'Unknown type'}</span>
                  </div>

                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="w-full bg-surface-200 rounded-full h-1">
                        <motion.div
                          className="bg-primary-500 h-1 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadedFile.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        {uploadedFile.progress}% uploaded
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <p className="text-xs text-danger mt-1">{uploadedFile.error}</p>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'pending' && (
                    <div className="w-8 h-8 bg-surface-200 rounded-full flex items-center justify-center">
                      <CloudArrowUpIcon className="w-4 h-4 text-text-muted" />
                    </div>
                  )}
                  
                  {uploadedFile.status === 'uploading' && (
                    <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  
                  {uploadedFile.status === 'success' && (
                    <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-secondary" />
                    </div>
                  )}
                  
                  {uploadedFile.status === 'error' && (
                    <div className="flex items-center space-x-1">
                      <div className="w-8 h-8 bg-danger/20 rounded-full flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-4 h-4 text-danger" />
                      </div>
                      <button
                        onClick={() => retryUpload(uploadedFile)}
                        className="text-xs text-primary-400 hover:text-primary-300"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 rounded-lg hover:bg-surface-200/50 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4 text-text-muted" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-text-muted"
        >
          Uploading files... Please don't close this window.
        </motion.div>
      )}
    </div>
  )
}

export default FileUpload
