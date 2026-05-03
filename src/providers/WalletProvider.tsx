"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { ReactNode, useMemo } from "react";

export function WalletProvider({ children }: { children: ReactNode }) {
  // Initialize with available wallet adapters
  const plugins = useMemo(() => {
    const wallets: any[] = [];
    // Wallet adapters from @aptos-labs/wallet-adapter-react are auto-discovered
    // This configuration allows the adapter to find installed wallets
    return wallets;
  }, []);

  return (
    <AptosWalletAdapterProvider
      plugins={plugins}
      autoConnect={true}
      optInWallets={["Petra", "MizuWallet"] as any}
      onError={(error) => {
        // Suppress wallet connection errors to reduce noise
        // Only log if it's not a user rejection
        if (error?.message && !error.message.includes("rejected")) {
          console.error("Aptos Wallet Error:", error);
        }
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}