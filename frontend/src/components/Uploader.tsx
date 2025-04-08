import type React from "react"

import { useState, useRef } from "react"
import { FileUp, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadResume } from "@/api/start"

interface ResumeUploaderProps {
  onFileUpload: (file: File) => void
  activeTab: string
  setAnalysisData: (data: any) => void
}

export default function Uploader({ onFileUpload, activeTab, setAnalysisData }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    try {
      const response = await uploadResume(file, activeTab);
      if (response && response.analysis) {
        setAnalysisData(response.analysis);
        onFileUpload(file);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await handleFileUpload(file);  // This automatically uploads the file when selected
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        await handleFileUpload(file);  // This automatically uploads the file when dropped
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const isGenuine = activeTab === "genuine"
  const primaryColor = isGenuine ? "rgb(99, 102, 241)" : "rgb(244, 63, 94)";
  const secondaryColor = isGenuine ? "rgb(79, 70, 229)" : "rgb(249, 115, 22)";
  const hoverPrimary = isGenuine ? "rgb(129, 140, 248)" : "rgb(251, 113, 133)";
  const hoverSecondary = isGenuine ? "rgb(99, 102, 241)" : "rgb(249, 115, 22)";

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "uploader-container relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-8 transition-all duration-500",
        isDragging
          ? isGenuine
            ? "border-primary/50 bg-primary/5"
            : "border-secondary/50 bg-secondary/5"
          : "border-zinc-800/50 dark:bg-zinc-900/20 backdrop-blur-sm hover:border-zinc-700/50",
      )}
      style={{
        "--primary-color": primaryColor,
        "--secondary-color": secondaryColor,
        "--hover-primary": hoverPrimary,
        "--hover-secondary": hoverSecondary,
      } as React.CSSProperties}
    >
      <div
        className="relative z-10 mb-6"
        style={{
          transform: isDragging ? 'translateY(-10px) scale(1.05)' : 'translateY(0) scale(1)',
          transition: 'transform 0.5s ease'
        }}
      >
        <div
          className={cn(
            "icon-container flex h-24 w-24 items-center justify-center rounded-full transition-all duration-500",
            isDragging
              ? "bg-gradient-active"
              : "bg-black/10 dark:bg-white/5",
          )}
          style={{
            background: isDragging
              ? `linear-gradient(to bottom right, var(--primary-color)/20%, var(--secondary-color)/20%)`
              : ""
          }}
        >
          <div
            style={{
              transform: isDragging ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.5s ease'
            }}
          >
            <FileUp
              className={cn(
                "h-10 w-10 transition-colors duration-500",
                isDragging ? "text-active" : "text-zinc-400",
              )}
              style={{ color: `var(--primary-color)` }}
            />
          </div>
        </div>
      </div>

      <h3
        style={{
          transform: isDragging ? 'translateY(-5px)' : 'translateY(0)',
          transition: 'transform 0.5s ease'
        }}
        className="relative z-10 mb-2 text-xl font-medium"
      >
        {isDragging ? "Drop to Upload" : "Upload Your Resume"}
      </h3>

      <p
        style={{
          transform: isDragging ? 'translateY(-5px)' : 'translateY(0)',
          opacity: isDragging ? 0.7 : 1,
          transition: 'transform 0.5s ease, opacity 0.5s ease'
        }}
        className="relative z-10 mb-6 text-center text-zinc-400"
      >
        Drag and drop your resume file here, or click to browse
      </p>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" className="hidden" />

      <div
        className="relative z-10"
        style={{
          transition: 'transform 0.2s ease'
        }}
      >
        <Button
          onClick={handleButtonClick}
          size="lg"
          className="upload-button relative overflow-hidden hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: `linear-gradient(to right, var(--primary-color), var(--secondary-color))`,
          }}
        >
          <span className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.05] mix-blend-soft-light"></span>
          <span className="relative z-10 flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Select File
          </span>
        </Button>
      </div>

      <p className="relative z-10 mt-4 text-sm text-zinc-500">Supported formats: PDF, DOC, DOCX</p>
    </div>
  )
}