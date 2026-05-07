import {
  createDefaultErasureCodingProvider,
  generateCommitments,
  ShelbyBlobClient,
  expectedTotalChunksets,
  ShelbyClient,
} from "@shelby-protocol/sdk/browser";
import { Aptos, AptosConfig, Network, AccountAddress } from "@aptos-labs/ts-sdk";

// Define the interface directly here to resolve the './types' import error
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

export function createAptosClient(): Aptos {
  return new Aptos(new AptosConfig({ network: Network.TESTNET }));
}

export async function createShelbyClient(): Promise<ShelbyClient> {
  return new ShelbyClient({ network: Network.TESTNET });
}

export async function uploadToShelby({
  file,
  account,
  signAndSubmitTransaction,
  onProgress,
}: {
  file: File;
  account: { address: string };
  signAndSubmitTransaction: (tx: any) => Promise<{ hash: string }>;
  onProgress?: (step: number, label: string) => void;
}) {
  const shelbyClient = await createShelbyClient();
  const aptosClient = createAptosClient();
  
  onProgress?.(1, "Encoding file with erasure coding");
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const provider = await createDefaultErasureCodingProvider();
  const commitments = await generateCommitments(provider, fileBuffer);

  onProgress?.(2, "Registering on Aptos blockchain");
  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account: AccountAddress.from(account.address),
    blobName: file.name,
    blobMerkleRoot: commitments.blob_merkle_root,
    numChunksets: expectedTotalChunksets(commitments.raw_data_size),
    expirationMicros: (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000,
    blobSize: commitments.raw_data_size,
    encoding: 0,
  });

  try {
    const submitted = await signAndSubmitTransaction({ data: payload });
    await aptosClient.waitForTransaction({ transactionHash: submitted.hash });

    onProgress?.(3, "Uploading to Shelby storage providers");
    await shelbyClient.rpc.putBlob({
      account: account.address,
      blobName: file.name,
      blobData: new Uint8Array(fileBuffer),
    });

    onProgress?.(4, "Complete!");
    return { 
      id: submitted.hash, 
      name: file.name, 
      size: file.size, 
      uploadedAt: new Date().toISOString(), 
      url: submitted.hash 
    } as ShelbyFile;

  } catch (error: any) {
    console.error("Shelby Upload Error:", error);
    throw new Error(error?.message || "Upload failed. Ensure your wallet is on Testnet and has a balance.");
  }
}

export async function listAccountFiles(shelbyClient: ShelbyClient, accountAddress: string): Promise<ShelbyFile[]> {
  try {
    const blobs = await shelbyClient.coordination.getAccountBlobs({ account: accountAddress });
    return blobs.map((b: any) => ({
      id: b.blobMerkleRoot || b.name,
      name: b.name,
      size: b.size || 0,
      uploadedAt: b.uploadedAt || new Date().toISOString(),
      url: `https://api.testnet.shelby.xyz/shelby/v1/blobs/${accountAddress}/${b.name}`,
    }));
  } catch (error) { 
    console.error("Failed to list files:", error);
    return []; 
  }
}