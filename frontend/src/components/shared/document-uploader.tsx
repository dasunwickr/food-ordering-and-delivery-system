"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { FileText, Upload, X, Check, Loader2, Download } from "lucide-react"
import { CldUploadButton } from "next-cloudinary"
import { toast } from "sonner"

interface DocumentInfo {
  name: string
  url: string
}

interface DocumentUploaderProps {
  documentName: string
  currentDocument: DocumentInfo
  onDocumentUpdate: (document: DocumentInfo) => void
  folder: string
  editable?: boolean
  classname?: string
}

export function DocumentUploader({
  documentName,
  currentDocument,
  onDocumentUpdate,
  folder = "food-ordering-system/documents",
  editable = true,
  classname = ""
}: DocumentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleUploadSuccess = (result: any) => {
    const documentUrl = result?.info?.secure_url
    
    console.log('Document uploaded:', documentUrl)
    
    if (documentUrl) {
      // Create a new document object to ensure state is properly updated
      const updatedDocument = {
        name: documentName,
        url: documentUrl
      }
      
      // Call the parent component's update function with the new document
      onDocumentUpdate(updatedDocument)
      toast.success(`${documentName} uploaded successfully`)
    } else {
      console.error("Failed to get document URL from result:", result)
      toast.error(`Failed to upload ${documentName}`)
    }
    
    setIsUploading(false)
  }

  const handleUploadError = () => {
    toast.error(`An error occurred while uploading ${documentName}`)
    setIsUploading(false)
  }

  const openDocument = () => {
    if (currentDocument.url) {
      window.open(currentDocument.url, '_blank')
    }
  }

  return (
    <div className={`relative flex items-center p-3 border rounded-md ${classname}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <FileText className="w-4 h-4 text-primary" />
      </div>
      
      <div className="flex-grow ml-3">
        <Label className="text-sm font-medium">{documentName}</Label>
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {currentDocument.url ? "Document uploaded" : "No document uploaded yet"}
        </p>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {currentDocument.url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80"
            onClick={openDocument}
          >
            <Download className="w-4 h-4" />
            <span className="sr-only">View document</span>
          </Button>
        )}

        {editable && (
          <CldUploadButton
            options={{
              maxFiles: 1,
              resourceType: "auto",
              folder: folder,
              clientAllowedFormats: ["pdf", "png", "jpg", "jpeg", "doc", "docx"],
              maxFileSize: 5000000, // 5MB
              sources: ["local", "url"],
              showUploadMoreButton: false,
              singleUploadAutoClose: true,
            }}
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
            onUpload={() => setIsUploading(true)}
            uploadPreset="food_ordering_app"
            className="h-auto p-0"
          >
            <div 
              className={`inline-flex items-center justify-center gap-2 px-2 py-1 text-sm font-medium rounded-md cursor-pointer ${
                isUploading ? 'opacity-70 pointer-events-none' : ''
              } ${
                currentDocument.url 
                  ? 'text-muted-foreground hover:bg-accent hover:text-accent-foreground' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              aria-disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : currentDocument.url ? (
                <>
                  <Upload className="w-4 h-4 mr-1" />
                  <span>Replace</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-1" />
                  <span>Upload</span>
                </>
              )}
            </div>
          </CldUploadButton>
        )}

        {currentDocument.url && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
            <Check className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  )
}