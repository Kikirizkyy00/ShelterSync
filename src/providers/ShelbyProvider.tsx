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
  ): Promise<ShelbyFile> => {
    if (!connected || !account) throw new Error("Wallet not connected");

    setUploading(true);
    try {
      // Step 1 - Erasure coding
      onProgress?.(1, "Encoding file with erasure coding...");
      const fileBuffer = await file.arrayBuffer();
      const provider = await createDefaultErasureCodingProvider();
      const commitments = await generateCommitments(provider, Buffer.from(fileBuffer));

      // Step 2 - Register on Aptos blockchain
      onProgress?.(2, "Registering on Aptos blockchain...");
      const aptosClient = createAptosClient();
      const shelbyClient = new ShelbyClient({ network: Network.TESTNET });

      const payload = ShelbyBlobClient.createRegisterBlobPayload({
        blobSize: fileBuffer.byteLength,
        reuseRegistration: true,
      });

      const tx = await signAndSubmitTransaction({ data: payload });
      await aptosClient.waitForTransaction({ transactionHash: tx.hash });

      // Step 3 - Upload to Shelby storage
      onProgress?.(3, "Uploading to Shelby storage providers...");
      await shelbyClient.rpc.putBlob({
        account: account.address,
        blobName: file.name,
        blobData: new Uint8Array(fileBuffer as ArrayBufferLike),
      });

      // Step 4 - Complete
      onProgress?.(4, "Complete!");

      const shelbyFile: ShelbyFile = {
        id: `shelby-${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        url: `https://shelby.xyz/blob/${account.address}/${file.name}`,
      };

      setFiles(prev => [...prev, shelbyFile]);
      return shelbyFile;

    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [connected, account, signAndSubmitTransaction]);

  return (
    <ShelbyContext.Provider value={{
      files,
      fetchFiles,
      download,
      isConnected: connected,
      upload,
      uploading,
      progress: uploadProgress,
      setUploadProgress,
    }}>
      {children}
    </ShelbyContext.Provider>
  );
}

export default ShelbyProvider;