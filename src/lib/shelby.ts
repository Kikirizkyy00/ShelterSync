import {
  createDefaultErasureCodingProvider,
  generateCommitments,
  ShelbyBlobClient,
  expectedTotalChunksets,
  ShelbyClient,
} from "@shelby-protocol/sdk/browser";
import { Aptos, AptosConfig, Network, AccountAddress } from "@aptos-labs/ts-sdk";

export interface ShelbyFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
}

const getApiKey = (): string | null => {
  const key = process.env.NEXT_PUBLIC_SHELBY_API_KEY;
  if (!key || key.trim() === "") return null;
  return key;
};

export function createAptosClient(): Aptos {
  const apiKey = getApiKey();
  return new Aptos(new AptosConfig({
    network: Network.TESTNET,
    ...(apiKey ? { clientConfig: { API_KEY: apiKey } } : {}),
  }));
}

export async function createShelbyClient(): Promise<ShelbyClient | null> {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    return new ShelbyClient({ network: Network.TESTNET, apiKey });
  } catch (error) {
    console.error("[ShelterSync] Failed to initialize ShelbyClient:", error);
    return null;
  }
}

export async function uploadToShelby({
  file, account, signAndSubmitTransaction, onProgress,
}: {
  file: File;
  account: { address: string };
  signAndSubmitTransaction: (tx: { data: unknown }) => Promise<{ hash: string }>;
  onProgress?: (step: number, label: string) => void;
}): Promise<ShelbyFile> {
  const shelbyClient = await createShelbyClient();
  if (!shelbyClient) throw new Error("Shelby API key not configured.");
  const aptosClient = createAptosClient();
  try {
    onProgress?.(1, "Encoding file with erasure coding...");
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const provider = await createDefaultErasureCodingProvider();
    const commitments = await generateCommitments(provider, fileBuffer);
    onProgress?.(2, "Registering on Aptos blockchain...");
    const payload = ShelbyBlobClient.createRegisterBlobPayload({
      account: AccountAddress.from(account.address),
      blobName: file.name,
      blobMerkleRoot: commitments.blob_merkle_root,
      numChunksets: expectedTotalChunksets(commitments.raw_data_size),
      expirationMicros: (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000,
      blobSize: commitments.raw_data_size,
      encoding: 0,
    });
    const submitted = await signAndSubmitTransaction({ data: payload });
    if (!submitted?.hash) throw new Error("Transaction returned empty response.");
    await aptosClient.waitForTransaction({ transactionHash: submitted.hash });
    onProgress?.(3, "Uploading to Shelby storage providers...");
    await shelbyClient.rpc.putBlob({
      account: account.address,
      blobName: file.name,
      blobData: new Uint8Array(fileBuffer),
    });
    onProgress?.(4, "Complete!");
    return { id: submitted.hash, name: file.name, size: file.size, uploadedAt: new Date().toISOString(), url: submitted.hash };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ShelterSync] Upload error:", error);
    throw new Error(message + ". Ensure wallet is on Testnet with APT + ShelbyUSD.");
  }
}

export async function listAccountFiles(shelbyClient: ShelbyClient, accountAddress: string): Promise<ShelbyFile[]> {
  try {
    const blobs = await shelbyClient.coordination.getAccountBlobs({ account: accountAddress });
    if (!Array.isArray(blobs)) return [];
    return (blobs as unknown[]).map((b) => {
      const blob = b as Record<string, unknown>;
      const root = blob.blobMerkleRoot;
      const id = root instanceof Uint8Array
        ? Array.from(root).map((x) => (x as number).toString(16).padStart(2, "0")).join("")
        : String(root ?? blob.name ?? "unknown");
      return {
        id,
        name: String(blob.name ?? "unnamed"),
        size: Number(blob.size ?? blob.blobSize ?? 0),
        uploadedAt: new Date().toISOString(),
        url: "https://api.testnet.shelby.xyz/shelby/v1/blobs/" + accountAddress + "/" + String(blob.name),
      };
    });
  } catch (error) {
    console.warn("[ShelterSync] Could not load files:", (error as Error).message);
    return [];
  }
}