"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  ShelbyFile, UploadProgress,
  createShelbyClient, createAptosClient,
  uploadToShelby, downloadFromShelby, listAccountFiles,
} from "@/lib/shelby";

type ShelbyContextType = {
  files: ShelbyFile[];
  uploading: boolean;
  progress: UploadProgress;
  isConnected: boolean;
  upload: (params: { file: File; taskId: number; taskTitle: string }) => Promise<ShelbyFile>;
  download: (file: ShelbyFile) => Promise<void>;
  fetchFiles: () => Promise<void>;
  addFile: (file: ShelbyFile) => void;
};

const ShelbyContext = createContext<ShelbyContextType | null>(null);

export function ShelbyProvider({ children }: { children: ReactNode }) {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [files, setFiles] = useState<ShelbyFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({ step: 0, label: "" });

  const upload = useCallback(async ({
    file, taskId, taskTitle,
  }: { file: File; taskId: number; taskTitle: string }) => {
    if (!connected || !account) throw new Error("Wallet not connected");
    setUploading(true);
    try {
      const shelbyClient = createShelbyClient();
      const aptosClient = createAptosClient();
      const result = await uploadToShelby({
        shelbyClient, file, account,
        signAndSubmitTransaction,
        aptosClient,
        onProgress: (step, label) => setProgress({ step, label }),
      });
      const newFile: ShelbyFile = {
        id: result.blobId,
        name: file.name,
        size: file.size,
        taskId,
        taskTitle,
        blobId: result.blobId,
        uploadedAt: new Date().toISOString(),
        downloadUrl: `https://api.testnet.shelby.xyz/shelby/v1/blobs/${account.address}/${file.name}`,
      };
      setFiles((prev) => [...prev, newFile]);
      return newFile;
    } finally {
      setUploading(false);
      setProgress({ step: 0, label: "" });
    }
  }, [connected, account, signAndSubmitTransaction]);

  const download = useCallback(async (file: ShelbyFile) => {
    await downloadFromShelby(file);
  }, []);

  const fetchFiles = useCallback(async () => {
    if (!connected || !account) return;
    const shelbyClient = createShelbyClient();
    const blobs = await listAccountFiles(shelbyClient, account.address);
    setFiles(blobs);
  }, [connected, account]);

  const addFile = useCallback((file: ShelbyFile) => {
    setFiles((prev) => [...prev, file]);
  }, []);

  return (
    <ShelbyContext.Provider value={{
      files, uploading, progress,
      isConnected: connected,
      upload, download, fetchFiles, addFile,
    }}>
      {children}
    </ShelbyContext.Provider>
  );
}

export function useShelby() {
  const ctx = useContext(ShelbyContext);
  if (!ctx) throw new Error("useShelby must be used inside ShelbyProvider");
  return ctx;
}
