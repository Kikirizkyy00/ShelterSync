"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ReactNode } from "react";

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={false}
      onError={(error) => {
        // Safe string extraction for robust error checking
        const errorString = error?.toString() || "";
        const errorMessage = typeof error === "object" && error !== null && "message" in error 
          ? (error as any).message 
          : errorString;

        // Catch typical user rejection patterns from Aptos ecosystem wallets (Petra, Pontem, etc.)
        if (
          errorMessage.toLowerCase().includes("rejected") || 
          errorMessage.toLowerCase().includes("user rejected")
        ) {
          // Downgrade to a warning since this is an expected intentional user action
          console.warn("[WalletProvider] Transaction cancelled by the user.");
          return;
        }

        // Keep logging genuine system or contract errors as critical errors
        console.error("[WalletProvider] Wallet error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}