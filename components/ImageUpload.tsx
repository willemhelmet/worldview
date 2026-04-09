"use client";

import { useRef, useCallback, useState, DragEvent } from "react";
import clsx from "clsx";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

export default function ImageUpload({ onImageSelected }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, or WebP images are supported.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Image must be under ${MAX_SIZE_MB}MB.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const err = validate(file);
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);
      onImageSelected(file);
    },
    [validate, onImageSelected]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      <div
        className={clsx(
          "relative w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
          "flex flex-col items-center justify-center gap-3 py-10 px-6",
          isDragging
            ? "border-white/50 bg-white/5"
            : "border-white/15 hover:border-white/30 hover:bg-white/3"
        )}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Upload image"
      >
        <div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center text-2xl">
          {isDragging ? "+" : ""}
          {!isDragging && (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-white/50"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        <div className="text-center space-y-1">
          <p className="text-white/80 text-sm font-medium">
            {isDragging ? "Drop to create world" : "Drop photo or click to browse"}
          </p>
          <p className="text-white/35 text-xs">JPEG, PNG, WebP — up to 10MB</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={handleInputChange}
          tabIndex={-1}
        />
      </div>

      {validationError && (
        <p className="text-red-400 text-xs text-center">{validationError}</p>
      )}
    </div>
  );
}
