import {
  createDefaultErasureCodingProvider,
  generateCommitments,
  ShelbyBlobClient,
  expectedTotalChunksets,
  ShelbyClient,
} from "@shelby-protocol/sdk/browser";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { ShelbyFile } from "./types";

export function createAptosClient(): Aptos {
  return new Aptos(
    new AptosConfig({
      network: Network.TESTNET,
      clientConfig: {
        API_KEY: process.env.NEXT_PUBLIC_APTOS_API_KEY,
      },
    })
  );
}

export function createShelbyClient(): ShelbyClient {
  return new ShelbyClient({
    network: Network.TESTNET,
    apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY,
  });
}

/**
 * uploadToShelby
 *
 * Uploads a file to the Shelby decentralized storage network
 * following the official 3-step process:
 *
 * Step 1 — File Encoding
 *   Split the file into chunks and generate commitment hashes
 *   using erasure coding for redundancy.
 *
 * Step 2 — On-Chain Registration
 *   Register the file metadata on the Aptos blockchain via
 *   the Shelby smart contract. Requires APT (gas) and ShelbyUSD.
 *
 * Step 3 — RPC Upload
 *   Upload the actual file data to Shelby storage providers
 *   after on-chain registration is confirmed.
 */
export async function uploadToShelby({
  shelbyClient,
  file,
  account,
  signAndSubmitTransaction,
  aptosClient,
  onProgress,
}: {
  shelbyClient: ShelbyClient;
  file: File;
  account: { address: string };
  signAndSubmitTransaction: (tx: { data: unknown }) => Promise<{ hash: string }>;
  aptosClient: Aptos;
  onProgress?: (step: number, label: string) => void;
}): Promise<{ blobId: string; blobName: string }> {
  // Step 1 — File Encoding
  onProgress?.(1, "Step 1/3: Encoding file with erasure coding...");
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const provider = await createDefaultErasureCodingProvider();
  const commitments = await generateCommitments(provider, fileBuffer);

  // Step 2 — On-Chain Registration
  onProgress?.(2, "Step 2/3: Registering metadata on Aptos blockchain...");
  const expirationMicros = (Date.now() + 1000 * 60 * 60 * 24 * 30) * 1000; // 30 days

  const payload = ShelbyBlobClient.createRegisterBlobPayload({
    account: account.address,
    blobName: file.name,
    blobMerkleRoot: commitments.blob_merkle_root,
    numChunksets: expectedTotalChunksets(commitments.raw_data_size),
    expirationMicros,
    blobSize: commitments.raw_data_size,
  });

  const submitted = await signAndSubmitTransaction({ data: payload });
  await aptosClient.waitForTransaction({ transactionHash: submitted.hash });

  // Step 3 — RPC Upload
  onProgress?.(3, "Step 3/3: Uploading data to Shelby storage providers...");
  await shelbyClient.rpc.putBlob({
    account: account.address,
    blobName: file.name,
    blobData: new Uint8Array(fileBuffer),
  });

  onProgress?.(4, "Done! File stored on the Shelby network.");
  return { blobId: submitted.hash, blobName: file.name };
}

export async function listAccountFiles(
  shelbyClient: ShelbyClient,
  accountAddress: string
): Promise<ShelbyFile[]> {
  try {
    const blobs = await shelbyClient.coordination.getAccountBlobs({
      account: accountAddress,
    });
    return blobs.map((b: any) => ({
      id: b.name,
      name: b.name,
      size: b.size ?? 0,
      taskId: 0,
      taskTitle: "",
      blobId: b.blobMerkleRoot ?? "",
      uploadedAt: b.uploadedAt ?? new Date().toISOString(),
      downloadUrl: `https://api.testnet.shelby.xyz/shelby/v1/blobs/${accountAddress}/${b.name}`,
    }));
  } catch {
    return [];
  }
}

export async function downloadFromShelby(file: ShelbyFile): Promise<void> {
  const res = await fetch(file.downloadUrl);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
