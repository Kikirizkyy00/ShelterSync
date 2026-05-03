cat > src/providers/ShelbyProvider.tsx << 'EOF'
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { ShelbyFile, UploadProgress } from "@/lib/types";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { ShelbyClient, ShelbyBlobClient, generateCommitments, createDefaultErasureCodingProvider } from "@shelby-protocol/sdk/browser";
import { createAptosClient } from "@/lib/shelby";
import { Network } from "@aptos-labs/ts-sdk";

export type { ShelbyFile, UploadProgress };

interface ShelbyContextType {
  files: ShelbyFile[];
  fetchFiles: () => Promise<void>;
  download: (fileId: string) => Promise<void>;
  isConnected: boolean;
  upload: (file: File, onProgress?: (step: number, label: string) => void) => Promise<ShelbyFile>;
  uploading: boolean;
  progress: UploadProgress | null;
  setUploadProgress: (progress: UploadProgress | null) => void;
}

const ShelbyContext = createContext<ShelbyContextType | undefined>(undefined);

export function useShelby() {
  const context = useContext(ShelbyContext);
  if (!context) throw new Error("useShelby must be used within ShelbyProvider");
  return context;
}

export function ShelbyProvider({ children }: { children: ReactNode }) {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [files, setFiles] = useState<ShelbyFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!connected) return;
    setFiles([]);
  }, [connected]);

  const download = useCallback(async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file && typeof window !== "undefined") {
      window.open(file.url, "_blank");
    }
  }, [files]);

  const upload = useCallback(async (
    file: File,
    onProgress?: (step: number, label: string) => void
  ): Promi