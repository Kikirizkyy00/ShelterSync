"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { createShelbyClient, listAccountFiles, uploadToShelby, ShelbyFile } from "@/lib/shelby";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface UploadProgress { step: number; label: string; }

interface ShelbyContextValue {
  client: ShelbyClient | null;
  isReady: boolean;
  files: ShelbyFile[];
  isLoadingFiles: boolean;
  upload: (file: File, onProgress?: (step: number, label: string) => void) => Promise<ShelbyFile>;
  uploading: boolean;
  progress: UploadProgress | null;
  setUploadProgress: (p: UploadProgress) => void;
  refreshFiles: () => Promise<void>;
  error: string | null;
}

const ShelbyContext = createContext<ShelbyContextValue | null>(null);

export function ShelbyProvider({ children }: { children: React.ReactNode }) {
  const { account, signAndSubmitTransaction } = useWallet();
  const [client, setClient] = useState<ShelbyClient | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [files, setFiles] = useState<ShelbyFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await createShelbyClient();
        if (!cancelled) { setClient(c); setIsReady(c !== null); }
      } catch (err) {
        if (!cancelled) console.error("[ShelbyProvider] Init error:", err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshFiles = useCallback(async () => {
    if (!client || !account?.address) return;
    setIsLoadingFiles(true);
    try {
      const result = await listAccountFiles(client, account.address.toString());
      setFiles(result);
    } catch (err) {
      console.warn("[ShelbyProvider] refreshFiles:", err);
    } finally {
      setIsLoadingFiles(false);
    }
  }, [client, account]);

  useEffect(() => {
    if (client && account?.address) refreshFiles();
    else setFiles([]);
  }, [client, account, refreshFiles]);

  const upload = useCallback(async (
    file: File,
    onProgress?: (step: number, label: string) => void
  ): Promise<ShelbyFile> => {
    if (!account?.address) throw new Error("No wallet connected.");
    setUploading(true);
    setProgress(null);
    try {
      const uploaded = await uploadToShelby({
        file,
        account: { address: account.address.toString() },
        signAndSubmitTransaction: signAndSubmitTransaction as (tx: { data: unknown }) => Promise<{ hash: string }>,
        onProgress: (step, label) => { setProgress({ step, label }); onProgress?.(step, label); },
      });
      setFiles((prev) => [uploaded, ...prev]);
      return uploaded;
    } finally {
      setUploading(false);
    }
  }, [account, signAndSubmitTransaction]);

  const setUploadProgress = useCallback((p: UploadProgress) => setProgress(p), []);

  return (
    <ShelbyContext.Provider value={{ client, isReady, files, isLoadingFiles, upload, uploading, progress, setUploadProgress, refreshFiles, error }}>
      {children}
    </ShelbyContext.Provider>
  );
}

export function useShelby(): ShelbyContextValue {
  const ctx = useContext(ShelbyContext);
  if (!ctx) throw new Error("useShelby must be used inside <ShelbyProvider>");
  return ctx;
}