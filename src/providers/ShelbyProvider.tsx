"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { ShelbyFile, UploadProgress } from "@/lib/types";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export type { ShelbyFile, UploadProgress };

interface ShelbyContextType {
  // File management
  files: ShelbyFile[];
  fetchFiles: () => Promise<void>;
  download: (fileId: string) => Promise<void>;
  isConnected: boolean;

  // Upload management
  upload: (file: File, onProgress?: (step: number, label: string) => void) => Promise<ShelbyFile>;
  uploading: boolean;
  progress: UploadProgress | null;
  setUploadProgress: (progress: UploadProgress | null) => void;
}

const ShelbyContext = createContext<ShelbyContextType | undefined>(undefined);

export function useShelby() {
  const context = useContext(ShelbyContext);
  if (!context) {
    throw new Error("useShelby must be used within ShelbyProvider");
  }
  return context;
}

interface ShelbyProviderProps {
  children: ReactNode;
}

export function ShelbyProvider({ children }: ShelbyProviderProps) {
  const { connected } = useWallet();
  const [files, setFiles] = useState<ShelbyFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!connected) return;
    // TODO: Implement actual file fetching from Shelby
    setFiles([]);
  }, [connected]);

  const download = useCallback(async (fileId: string) => {
    // TODO: Implement actual download from Shelby
    const file = files.find(f => f.id === fileId);
    if (file && typeof window !== "undefined") {
      window.alert(`Download: ${file.name}`);
    }
  }, [files]);

  const upload = useCallback(async (
    file: File,
    onProgress?: (step: number, label: string) => void
  ): Promise<ShelbyFile> => {
    if (!connected) throw new Error("Wallet not connected");
    
    setUploading(true);
    try {
      onProgress?.(1, "Preparing file...");
      await new Promise(r => setTimeout(r, 800));

      onProgress?.(2, "Registering...");
      await new Promise(r => setTimeout(r, 800));

      onProgress?.(3, "Saving...");
      await new Promise(r => setTimeout(r, 800));

      onProgress?.(4, "Complete!");

      const shelbyFile: ShelbyFile = {
        id: `local-${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: "#",
      };

      setFiles(prev => [...prev, shelbyFile]);
      return shelbyFile;
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [connected]);

  const contextValue: ShelbyContextType = {
    files,
    fetchFiles,
    download,
    isConnected: connected,
    upload,
    uploading,
    progress: uploadProgress,
    setUploadProgress,
  };

  return (
    <ShelbyContext.Provider value={contextValue}>
      {children}
    </ShelbyContext.Provider>
  );
}

export default ShelbyProvider;
