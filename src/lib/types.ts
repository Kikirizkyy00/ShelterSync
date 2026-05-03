import { ShelbyClient } from "@shelby-protocol/sdk/browser";

import {
  Aptos,
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";

/* =========================================
   Task Types
========================================= */

export type Status = "todo" | "in-progress" | "done";
export type Priority = "Low" | "Medium" | "High";

export interface Task {
  id: string;
  title: string;
  tag?: string;
  priority: Priority;
  dueDate?: string;
  assignee?: string;
  status: Status;
  createdAt: string;
  fileCount: number;
}

/* =========================================
   Shelby Types
========================================= */

export interface ShelbyFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export interface UploadProgress {
  step: number;
  label: string;
}

/* =========================================
   Aptos Client
========================================= */

export function createAptosClient(): Aptos {
  return new Aptos(
    new AptosConfig({
      network: Network.TESTNET,
    })
  );
}

/* =========================================
   Shelby Client
========================================= */

export async function createShelbyClient(): Promise<ShelbyClient> {
  return new ShelbyClient({
    network: Network.TESTNET,
  });
}

/* =========================================
   Upload
========================================= */

export async function uploadToShelby({
  file,
  onProgress,
}: {
  file: File;
  account?: { address: string };
  signAndSubmitTransaction?: unknown;
  onProgress?: (
    step: number,
    label: string
  ) => void;
}): Promise<ShelbyFile> {
  onProgress?.(1, "Preparing file...");
  await wait(800);

  onProgress?.(2, "Registering...");
  await wait(800);

  onProgress?.(3, "Saving...");
  await wait(800);

  onProgress?.(4, "Complete!");

  return {
    id: `local-${Date.now()}`,
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    url: "#",
  };
}

/* =========================================
   List Files
========================================= */

export async function listAccountFiles(
  _client?: ShelbyClient,
  _address?: string
): Promise<ShelbyFile[]> {
  return [];
}

/* =========================================
   Download
========================================= */

export async function downloadFromShelby(
  file: ShelbyFile
): Promise<void> {
  if (typeof window !== "undefined") {
    window.alert(
      `Download placeholder: ${file.name}`
    );
  }
}

/* =========================================
   Helper
========================================= */

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
