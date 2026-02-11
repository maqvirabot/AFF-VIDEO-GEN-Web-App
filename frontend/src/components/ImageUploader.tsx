'use client'

import { useCallback, useState } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { api } from '@/lib/api'

export function ImageUploader() {
    const { form, setForm } = useAppStore()
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = useCallback(async (file: File) => {
        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file')
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('File too large. Max 10MB allowed.')
            return
        }

        setError(null)
        setIsUploading(true)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setForm({ imagePreview: e.target?.result as string })
        }
        reader.readAsDataURL(file)

        try {
            const result = await api.uploadImage(file)

            if (result.success && result.url) {
                setForm({ imageUrl: result.url })
            } else {
                setError(result.error || 'Upload failed')
                setForm({ imagePreview: null })
            }
        } catch {
            setError('Failed to upload image')
            setForm({ imagePreview: null })
        } finally {
            setIsUploading(false)
        }
    }, [setForm])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleUpload(file)
        }
    }, [handleUpload])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUpload(file)
        }
    }, [handleUpload])

    const clearImage = () => {
        setForm({ imageUrl: null, imagePreview: null })
        setError(null)
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
                Product Image
            </label>

            {form.imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800">
                    <img
                        src={form.imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                    />

                    {/* Uploading overlay */}
                    {isUploading && (
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                            <div className="flex items-center gap-2 text-white">
                                <Loader2 className="animate-spin" size={20} />
                                <span>Uploading...</span>
                            </div>
                        </div>
                    )}

                    {/* Upload success indicator */}
                    {form.imageUrl && !isUploading && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-green-500/80 text-white text-xs">
                            ✓ Uploaded
                        </div>
                    )}

                    {/* Remove button */}
                    <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 hover:bg-red-500 text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer ${isDragging
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                        }`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                        {isDragging ? (
                            <>
                                <Upload className="text-purple-400" size={32} />
                                <span className="text-purple-400 font-medium">Drop image here</span>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
                                    <ImageIcon className="text-slate-400" size={24} />
                                </div>
                                <div className="text-center">
                                    <span className="text-slate-300 font-medium">Drop image here or click to upload</span>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP up to 10MB</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}
