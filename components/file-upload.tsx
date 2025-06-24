"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { UploadCloud } from "lucide-react"

interface FileUploadProps {
  onUploadSuccess: () => void
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an .xlsx file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload-excel", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "File upload failed")
      }

      toast({
        title: "Upload Successful",
        description: `${result.insertedCount || 0} anomalies processed from ${file.name}.`,
      })
      onUploadSuccess() // Callback to refresh data or give other feedback
      setFile(null) // Reset file input
      // Reset the actual input field value
      const fileInput = event.target as HTMLFormElement
      fileInput.reset()
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-card"
    >
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="excel-file">Upload Excel (.xlsx)</Label>
        <Input id="excel-file" type="file" accept=".xlsx" onChange={handleFileChange} disabled={isUploading} />
      </div>
      <Button
        type="submit"
        disabled={isUploading || !file}
        className="w-full sm:w-auto mt-2 sm:mt-0 self-end sm:self-center"
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>
    </form>
  )
}

FileUpload.defaultProps = {
  onUploadSuccess: () => {},
}
