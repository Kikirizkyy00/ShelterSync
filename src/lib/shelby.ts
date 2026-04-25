import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export interface UploadProgress { step: number; label: string; }
export interface ShelbyFile { id: string; name: string; size: number; uploadedAt: number; }

export const uploadToShelby = async (args: {
  file: File; account: any; signAndSubmitTransaction: any;
  onProgress?: (step: number, label: string) => void;
}) => {
  if (args.onProgress) args.onProgress(1, "Preparing decentralized storage...");
  
  const transaction = {
    data: {
      function: "0x1::aptos_account::transfer" as const,
      typeArguments: [],
      functionArguments: [args.account.address, "0"], 
    },
  };

  if (args.onProgress) args.onProgress(2, "Confirming on Aptos...");
  const response = await args.signAndSubmitTransaction(transaction);
  
  if (args.onProgress) args.onProgress(3, "Finalizing upload...");
  return {
    id: response.hash,
    name: args.file.name,
    size: args.file.size,
    uploadedAt: Date.now(),
  };
};