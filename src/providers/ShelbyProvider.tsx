"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ShelbyFile, UploadProgress, uploadToShelby } from '@/lib/shelby';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface ShelbyContextType {
  files: ShelbyFile[];
  uploading: boolean;
  progress: UploadProgress;
  isConnected: boolean;
  upload: (data: { file: File; id: number; name: string }) => Promise<void>;
  fetchFiles: () => void;
  download: (id: string) => void;
}

const ShelbyContext = createContext<ShelbyContextType | undefined>(undefined);

export function ShelbyProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<ShelbyFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ step: 0, label: "" });
  const { account, connected, signAndSubmitTransaction } = useWallet();

  const fetchFiles = useCallback(() => {
    console.log("Refreshing files...");
  }, []);

  const download = useCallback((id: string) => {
    window.open(`https://explorer.aptoslabs.com/txn/${id}?network=testnet`, '_blank');
  }, []);

  const upload = useCallback(async ({ file, id, name }: { file: File; id: number; name: string }) => {
    if (!account) return;
    setUploading(true);
    try {
      const result = await uploadToShelby({
        file, account, signAndSubmitTransaction,
        onProgress: (step, label) => setProgress({ step, label }),
      });
      setFiles(prev => [result, ...prev]);
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setProgress({ step: 0, label: "" });
    }
  }, [account, signAndSubmitTransaction]);

  return (
    <ShelbyContext.Provider value={{ 
      files, uploading, progress, isConnected: connected, 
      upload, fetchFiles, download 
    }}>
      {children}
    </ShelbyContext.Provider>
  );
}

export const useShelby = () => {
  const context = useContext(ShelbyContext);
  if (!context) throw new Error('useShelby must be used within ShelbyProvider');
  return context;
};